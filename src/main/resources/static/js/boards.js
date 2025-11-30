// GraphQL Client
async function graphqlRequest(query, variables = {}) {
    const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ query, variables })
    });
    
    const result = await response.json();
    if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
    }
    return result.data;
}

// Load boards
async function loadBoards() {
    const query = `
        query {
            myBoards {
                id
                title
                description
                createdAt
            }
        }
    `;
    
    try {
        const data = await graphqlRequest(query);
        displayBoards(data.myBoards);
    } catch (error) {
        console.error('Error loading boards:', error);
        document.getElementById('boardsList').innerHTML = 
            '<p class="loading">Error loading boards. Please try again.</p>';
    }
}

// Display boards
function displayBoards(boards) {
    const boardsList = document.getElementById('boardsList');
    
    if (boards.length === 0) {
        boardsList.innerHTML = '<p class="loading">No boards yet. Create your first board!</p>';
        return;
    }
    
    boardsList.innerHTML = boards.map(board => `
        <div class="board-card" onclick="openBoard('${board.id}')">
            <h3>${escapeHtml(board.title)}</h3>
            <p>${escapeHtml(board.description || 'No description')}</p>
            <small>Created: ${new Date(board.createdAt).toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Open board
function openBoard(boardId) {
    window.location.href = `/board/${boardId}`;
}

// Create board
async function createBoard(title, description) {
    const mutation = `
        mutation CreateBoard($input: CreateBoardInput!) {
            createBoard(input: $input) {
                id
                title
                description
            }
        }
    `;
    
    const variables = {
        input: { title, description }
    };
    
    try {
        await graphqlRequest(mutation, variables);
        loadBoards();
        closeModal();
    } catch (error) {
        console.error('Error creating board:', error);
        alert('Error creating board: ' + error.message);
    }
}

// Modal handling
const modal = document.getElementById('createBoardModal');
const btn = document.getElementById('createBoardBtn');
const span = document.getElementsByClassName('close')[0];

btn.onclick = () => modal.style.display = 'block';
span.onclick = closeModal;
window.onclick = (event) => {
    if (event.target === modal) {
        closeModal();
    }
};

function closeModal() {
    modal.style.display = 'none';
    document.getElementById('createBoardForm').reset();
}

// Form submission
document.getElementById('createBoardForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('boardTitle').value;
    const description = document.getElementById('boardDescription').value;
    createBoard(title, description);
});

// Utility function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load boards on page load
loadBoards();

