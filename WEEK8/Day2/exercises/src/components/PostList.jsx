import React from 'react';
import data from './data2.json';

const PostList = () => {
  return (
    <div className="container mt-4">
      <h2>Exercise 2: Post List</h2>
      <div className="row">
        {data.map((post) => (
          <div key={post.id} className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title text-primary">{post.title}</h5>
                <p className="card-text text-secondary">{post.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;
