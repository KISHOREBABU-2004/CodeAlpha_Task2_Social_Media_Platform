// DOM Elements
const authForms = document.getElementById('auth-forms');
const postForm = document.getElementById('post-form');
const postsContainer = document.getElementById('posts-container');
const newPostForm = document.getElementById('new-post-form');
const welcomeMessage = document.getElementById('welcome-message');
const logoutBtn = document.getElementById('logout-btn');

// State
let currentUser = null;
let authToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  authToken = localStorage.getItem('authToken');
  currentUser = JSON.parse(localStorage.getItem('user'));
  
  if (!authToken || !currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Set welcome message
  welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;
  welcomeMessage.classList.remove('hidden');

  // Initialize app
  showAppContent();
  renderPosts();

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

// Event Listeners
if (newPostForm) {
  newPostForm.addEventListener('submit', handlePostSubmit);
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('profile-btn')) {
    const userId = e.target.dataset.userId;
    window.location.href = `profile.html?userId=${userId}`;
  }
});

// Functions
function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function showAppContent() {
  if (authForms) authForms.classList.add('hidden');
  if (postForm) postForm.classList.remove('hidden');
}

async function renderPosts() {
  try {
    const response = await fetch('http://localhost:3000/api/posts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const posts = await response.json();
    
    if (postsContainer) {
      postsContainer.innerHTML = posts.map(post => `
        <div class="post" data-id="${post.id}">
          <div class="post-header">
            <h3>${post.User.username}</h3>
            <small>${new Date(post.createdAt).toLocaleString()}</small>
          </div>
          <p>${post.content}</p>
          
          <div class="post-actions">
            <button class="like-btn ${post.Likes.some(like => like.userId === currentUser?.id) ? 'liked' : ''}" 
                    data-post-id="${post.id}">
              ❤️ ${post.Likes.length}
            </button>
            <span>💬 ${post.Comments.length}</span>
            <button class="profile-btn" data-user-id="${post.User.id}">Profile</button>
          </div>
          
          <div class="comments">
            ${post.Comments.map(comment => `
              <div class="comment">
                <strong>${comment.User.username}:</strong>
                <p>${comment.content}</p>
              </div>
            `).join('')}
          </div>
          
          <form class="comment-form">
            <input type="text" placeholder="Write a comment..." required>
            <button type="submit">Post</button>
          </form>
        </div>
      `).join('');
      
      // Add event listeners for new elements
      document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', handleLike);
      });
      
      document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', handleCommentSubmit);
      });
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

async function handlePostSubmit(e) {
  e.preventDefault();
  const content = document.getElementById('post-content').value;

  try {
    const response = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content })
    });
    
    if (response.ok) {
      document.getElementById('post-content').value = '';
      renderPosts();
      showFeedback('Post created!', 'success');
    } else {
      const data = await response.json();
      showFeedback(data.error || 'Post failed', 'error');
    }
  } catch (error) {
    showFeedback('Post failed', 'error');
    console.error('Post error:', error);
  }
}

async function handleLike(e) {
  const postId = e.target.dataset.postId;
  
  try {
    const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      renderPosts();
    }
  } catch (error) {
    console.error('Error liking post:', error);
  }
}

async function handleCommentSubmit(e) {
  e.preventDefault();
  const postId = e.target.closest('.post').dataset.id;
  const content = e.target.querySelector('input').value;
  
  try {
    const response = await fetch('http://localhost:3000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content, postId })
    });
    
    if (response.ok) {
      e.target.querySelector('input').value = '';
      renderPosts();
    }
  } catch (error) {
    console.error('Error posting comment:', error);
  }
}

function showFeedback(message, type) {
  const feedback = document.createElement('div');
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 3000);
}