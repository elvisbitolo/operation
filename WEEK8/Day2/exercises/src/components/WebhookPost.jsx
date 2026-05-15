import React, { useState } from 'react';

const WebhookPost = () => {
  const [response, setResponse] = useState(null);

  const postData = async () => {
    const url = 'https://webhook.site/placeholder-url'; // User needs to replace this
    const data = {
      key1: 'myusername',
      email: 'mymail@gmail.com',
      name: 'Isaac',
      lastname: 'Doe',
      age: 27
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log('Response:', res);
      setResponse("Data sent! Check console and webhook.site");
    } catch (error) {
      console.error('Error:', error);
      setResponse("Error sending data. Did you replace the placeholder URL?");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Exercise 4: Post to Webhook</h2>
      <p className="text-muted">Note: Please replace the placeholder webhook URL in the code to see the actual request on webhook.site.</p>
      <button className="btn btn-primary" onClick={postData}>Post Data</button>
      {response && <div className="alert alert-info mt-3">{response}</div>}
    </div>
  );
};

export default WebhookPost;
