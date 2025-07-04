document.addEventListener('DOMContentLoaded', async () => {
    // Get user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (!userId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Fetch user data
        const response = await fetch(`http://localhost:3000/api/users/${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const user = await response.json();
        renderProfile(user);
    } catch (error) {
        console.error('Profile error:', error);
        window.location.href = 'index.html';
    }
});

function renderProfile(user) {
    // Profile info section
    document.getElementById('profile-info').innerHTML = `
        <h2>${user.username}'s Profile</h2>
        <p>Member since: ${new Date(user.createdAt).toLocaleDateString()}</p>
        <p>Email: ${user.email}</p>
    `;

    // Posts section
    const postsHTML = user.Posts?.length ? 
        user.Posts.map(post => `
            <div class="post">
                <p>${post.content}</p>
                <small>${new Date(post.createdAt).toLocaleString()}</small>
            </div>
        `).join('') : 
        '<p>No posts yet</p>';

    document.getElementById('user-posts').innerHTML = `
        <h3>Posts (${user.Posts?.length || 0})</h3>
        ${postsHTML}
    `;

    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}