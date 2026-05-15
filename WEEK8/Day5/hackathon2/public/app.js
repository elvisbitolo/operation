import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
    getFirestore, collection, doc, setDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, addDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA8T1P2X7huSvV1w3VRGRM93PWvhbcqTXE",
    authDomain: "hack-14ae1.firebaseapp.com",
    projectId: "hack-14ae1",
    storageBucket: "hack-14ae1.firebasestorage.app",
    messagingSenderId: "165708034616",
    appId: "1:165708034616:web:93378611ceeb01ce6c6ccd",
    measurementId: "G-QBYZYZGV28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// State
let currentUser = null;
let currentChatUser = null; 
let unsubscribeMessages = null;
let unsubscribePresence = null;
let typingTimeout = null;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const landingScreen = document.getElementById('landing-screen');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const whatsappApp = document.getElementById('whatsapp-app');

// Dark Mode Logic
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (localStorage.getItem('darkMode') === 'enabled') document.body.classList.add('dark-mode');

darkModeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
};

// UI Toggles
document.getElementById('show-login-btn').onclick = () => { landingScreen.classList.add('hidden'); loginScreen.classList.remove('hidden'); };
document.getElementById('show-signup-btn').onclick = () => { landingScreen.classList.add('hidden'); signupScreen.classList.remove('hidden'); };
document.getElementById('link-to-signup').onclick = () => { loginScreen.classList.add('hidden'); signupScreen.classList.remove('hidden'); };
document.getElementById('link-to-login').onclick = () => { signupScreen.classList.add('hidden'); loginScreen.classList.remove('hidden'); };
document.getElementById('login-to-landing').onclick = () => { loginScreen.classList.add('hidden'); landingScreen.classList.remove('hidden'); };
document.getElementById('signup-to-landing').onclick = () => { signupScreen.classList.add('hidden'); landingScreen.classList.remove('hidden'); };

document.getElementById('chat-back-btn').onclick = () => {
    whatsappApp.classList.remove('show-chat');
    document.getElementById('active-chat-container').classList.add('hidden');
    document.getElementById('empty-chat-state').classList.remove('hidden');
    if (unsubscribeMessages) unsubscribeMessages();
    if (unsubscribePresence) unsubscribePresence();
    currentChatUser = null;
};

// Email Sender Helper
async function sendNotificationEmail(to, subject, text) {
    try {
        const response = await fetch('/api/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, text })
        });
        if (!response.ok) {
            const err = await response.json();
            console.error("Server email error:", err);
            alert("Email notification failed: " + (err.error || "Unknown error"));
        } else {
            console.log("Email notification sent successfully to", to);
        }
    } catch (e) { 
        console.error("Email fetch failed:", e);
        alert("Could not connect to email server.");
    }
}

// Presence Logic (Server-side simulation for Hackathon)
async function updateOnlineStatus(isOnline) {
    if (!currentUser) return;
    try {
        await updateDoc(doc(db, "users", currentUser.uid), {
            isOnline: isOnline,
            lastSeen: serverTimestamp(),
            typingTo: null
        });
    } catch (e) { console.error("Presence update failed", e); }
}

// Authentication Handlers
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const errorEl = document.getElementById('signup-error');
    
    errorEl.textContent = "Creating account...";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: name,
            email: email,
            phoneNumber: phone,
            photoURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            isOnline: true,
            lastSeen: serverTimestamp()
        });
        await sendNotificationEmail(email, "Welcome to Chat!", `Hi ${name}, your account is successfully created!`);
    } catch (error) { errorEl.textContent = error.message; }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = "Logging in...";
    try {
        await signInWithEmailAndPassword(auth, email, password);
        await sendNotificationEmail(email, "New Login Alert", "You have successfully logged into Chat.");
    } catch (error) { errorEl.textContent = error.message; }
});

document.getElementById('google-signin-btn').addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            phoneNumber: user.phoneNumber || "",
            photoURL: user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            isOnline: true,
            lastSeen: serverTimestamp()
        }, { merge: true });
        await sendNotificationEmail(user.email, "Login Alert", "You logged in via Google.");
    } catch (error) { alert(error.message); }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await updateOnlineStatus(false);
    signOut(auth);
});

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authContainer.classList.add('hidden');
        whatsappApp.classList.remove('hidden');
        updateOnlineStatus(true);
        loadSidebar();
    } else {
        currentUser = null;
        authContainer.classList.remove('hidden');
        whatsappApp.classList.add('hidden');
        landingScreen.classList.remove('hidden');
    }
});

// Profile Photo Update
const myProfileImg = document.getElementById('my-profile-img');
const profilePhotoUpload = document.getElementById('profile-photo-upload');
myProfileImg.onclick = () => profilePhotoUpload.click();
profilePhotoUpload.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    try {
        myProfileImg.style.opacity = "0.5";
        const storageRef = ref(storage, `profile_photos/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "users", currentUser.uid), { photoURL: photoURL });
        myProfileImg.src = photoURL;
        myProfileImg.style.opacity = "1";
    } catch (err) { console.error(err); myProfileImg.style.opacity = "1"; }
};

// WhatsApp Logic
async function loadSidebar() {
    const contactList = document.getElementById('contact-list');
    const searchInput = document.querySelector('.search-bar input');
    let allUsers = [];

    const renderList = (filter = '') => {
        contactList.innerHTML = '';
        allUsers.forEach((data) => {
            if (data.uid === currentUser.uid) return;
            if (filter && !data.displayName.toLowerCase().includes(filter.toLowerCase())) return;

            const div = document.createElement('div');
            div.className = 'contact-item';
            div.innerHTML = `
                <div class="avatar-container">
                    <img src="${data.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="avatar">
                    <span class="status-dot ${data.isOnline ? 'online' : ''}"></span>
                </div>
                <div class="contact-info">
                    <div class="contact-name">${data.displayName || data.email || ''}</div>
                    <div class="contact-status">${data.isOnline ? 'online' : 'offline'}</div>
                </div>
            `;
            div.onclick = () => startChat(data);
            contactList.appendChild(div);
        });
    };

    onSnapshot(collection(db, "users"), (snapshot) => {
        allUsers = [];
        snapshot.forEach((d) => {
            const data = d.data();
            if (data.uid === currentUser.uid) {
                document.getElementById('my-profile-name').textContent = data.displayName || 'Me';
                document.getElementById('my-profile-img').src = data.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            } else { allUsers.push(data); }
        });
        renderList(searchInput.value);
    });
    searchInput.oninput = (e) => renderList(e.target.value);
}

function startChat(contact) {
    currentChatUser = contact;
    whatsappApp.classList.add('show-chat');
    document.getElementById('empty-chat-state').classList.add('hidden');
    document.getElementById('active-chat-container').classList.remove('hidden');
    document.getElementById('active-chat-name').textContent = contact.displayName;
    document.getElementById('active-chat-img').src = contact.photoURL;

    // Listen for their typing status
    if (unsubscribePresence) unsubscribePresence();
    unsubscribePresence = onSnapshot(doc(db, "users", contact.uid), (doc) => {
        const data = doc.data();
        const indicator = document.getElementById('typing-indicator');
        if (data.typingTo === currentUser.uid) {
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    });

    loadMessages();
}

// Typing Indicator
const messageInput = document.getElementById('message-input');
messageInput.oninput = () => {
    if (!currentChatUser) return;
    updateDoc(doc(db, "users", currentUser.uid), { typingTo: currentChatUser.uid });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        updateDoc(doc(db, "users", currentUser.uid), { typingTo: null });
    }, 2000);
};

// Image Upload in Chat
const chatImageUpload = document.getElementById('chat-image-upload');
chatImageUpload.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChatUser) return;
    try {
        const convoId = [currentUser.uid, currentChatUser.uid].sort().join('_');
        const storageRef = ref(storage, `chat_images/${convoId}/${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, `conversations/${convoId}/messages`), {
            type: 'image',
            url: url,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        });
    } catch (err) { console.error(err); }
};

function formatTime(timestamp) {
    if (!timestamp) return '...';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function loadMessages() {
    if (unsubscribeMessages) unsubscribeMessages();
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    const convoId = [currentUser.uid, currentChatUser.uid].sort().join('_');
    const q = query(collection(db, `conversations/${convoId}/messages`), orderBy("timestamp", "asc"));

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const data = change.doc.data();
                const isSent = data.senderId === currentUser.uid;
                const div = document.createElement('div');
                div.className = `message ${isSent ? 'sent' : 'received'}`;
                div.id = `msg-${change.doc.id}`;
                
                if (data.type === 'image') {
                    div.innerHTML = `<img src="${data.url}" class="message-img" onclick="window.open('${data.url}')"><span class="time">${formatTime(data.timestamp)}</span>`;
                } else {
                    div.innerHTML = `<span class="text">${data.text}</span><span class="time">${formatTime(data.timestamp)}</span>`;
                }
                container.appendChild(div);
            }
            if (change.type === "modified") {
                const el = document.getElementById(`msg-${change.doc.id}`);
                if (el) el.querySelector('.time').textContent = formatTime(change.doc.data().timestamp);
            }
        });
        container.scrollTop = container.scrollHeight;
    });
}

document.getElementById('message-form').onsubmit = async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !currentChatUser) return;
    messageInput.value = '';
    const convoId = [currentUser.uid, currentChatUser.uid].sort().join('_');
    try {
        await addDoc(collection(db, `conversations/${convoId}/messages`), {
            text: text,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        });
    } catch (err) { console.error(err); }
};
