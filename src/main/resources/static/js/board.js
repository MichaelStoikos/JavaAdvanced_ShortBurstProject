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

// Initialize Cytoscape
let cy;

function initCytoscape() {
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)',
                    'shape': 'data(shape)',
                    'width': 'data(size)',
                    'height': 'data(size)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '14px',
                    'color': '#fff',
                    'text-outline-width': 2,
                    'text-outline-color': 'data(color)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': 'data(color)',
                    'target-arrow-color': 'data(color)',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': '12px'
                }
            },
            {
                selector: ':selected',
                style: {
                    'border-width': 3,
                    'border-color': '#ff0000'
                }
            }
        ],
        layout: {
            name: 'preset'
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true
    });
    
    // Enable edge creation by dragging
    cy.on('tapstart', 'node', function(evt) {
        const node = evt.target;
        node.data('dragStart', true);
    });
    
    cy.on('tapend', 'node', function(evt) {
        const node = evt.target;
        if (node.data('dragStart')) {
            node.removeData('dragStart');
        }
    });
    
    // Double click to edit node
    cy.on('dbltap', 'node', function(evt) {
        const node = evt.target;
        const newLabel = prompt('Enter new label:', node.data('label'));
        if (newLabel !== null && newLabel !== node.data('label')) {
            updateNode(node.id(), { label: newLabel });
        }
    });
    
    // Update node position on drag
    cy.on('dragfree', 'node', function(evt) {
        const node = evt.target;
        const position = node.position();
        updateNode(node.id(), { x: position.x, y: position.y });
    });
    
    // Context menu for creating edges
    cy.on('cxttap', 'node', function(evt) {
        const sourceNode = evt.target;
        cy.nodes().removeClass('source-selected');
        sourceNode.addClass('source-selected');
        
        const targetHandler = function(targetEvt) {
            const targetNode = targetEvt.target;
            if (targetNode.id() !== sourceNode.id()) {
                createEdge(sourceNode.id(), targetNode.id());
            }
            cy.nodes().removeClass('source-selected');
            cy.off('tap', 'node', targetHandler);
        };
        
        cy.on('tap', 'node', targetHandler);
    });
}

// Load board data
async function loadBoardData() {
    const nodesQuery = `
        query GetNodes($boardId: ID!) {
            nodes(boardId: $boardId) {
                id
                label
                x
                y
                color
                shape
                size
            }
        }
    `;
    
    const edgesQuery = `
        query GetEdges($boardId: ID!) {
            edges(boardId: $boardId) {
                id
                source
                target
                label
                color
            }
        }
    `;
    
    try {
        const [nodesData, edgesData] = await Promise.all([
            graphqlRequest(nodesQuery, { boardId }),
            graphqlRequest(edgesQuery, { boardId })
        ]);
        
        // Add nodes
        nodesData.nodes.forEach(node => {
            cy.add({
                group: 'nodes',
                data: {
                    id: node.id,
                    label: node.label,
                    color: node.color || '#3498db',
                    shape: node.shape || 'ellipse',
                    size: node.size || 50
                },
                position: { x: node.x, y: node.y }
            });
        });
        
        // Add edges
        edgesData.edges.forEach(edge => {
            cy.add({
                group: 'edges',
                data: {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label || '',
                    color: edge.color || '#95a5a6'
                }
            });
        });
        
        cy.fit();
    } catch (error) {
        console.error('Error loading board data:', error);
        alert('Error loading board data: ' + error.message);
    }
}

// Create node
async function createNode(label) {
    const color = document.getElementById('nodeColor').value;
    const shape = document.getElementById('nodeShape').value;
    
    const mutation = `
        mutation CreateNode($input: CreateNodeInput!) {
            createNode(input: $input) {
                id
                label
                x
                y
                color
                shape
                size
            }
        }
    `;
    
    const variables = {
        input: {
            boardId,
            label,
            x: cy.width() / 2,
            y: cy.height() / 2,
            color,
            shape,
            size: 50
        }
    };
    
    try {
        const data = await graphqlRequest(mutation, variables);
        const node = data.createNode;
        
        cy.add({
            group: 'nodes',
            data: {
                id: node.id,
                label: node.label,
                color: node.color,
                shape: node.shape,
                size: node.size
            },
            position: { x: node.x, y: node.y }
        });
    } catch (error) {
        console.error('Error creating node:', error);
        alert('Error creating node: ' + error.message);
    }
}

// Update node
async function updateNode(nodeId, updates) {
    const mutation = `
        mutation UpdateNode($id: ID!, $input: UpdateNodeInput!) {
            updateNode(id: $id, input: $input) {
                id
                label
                x
                y
                color
                shape
                size
            }
        }
    `;
    
    const variables = {
        id: nodeId,
        input: updates
    };
    
    try {
        const data = await graphqlRequest(mutation, variables);
        const node = cy.getElementById(nodeId);
        if (data.updateNode.label) node.data('label', data.updateNode.label);
    } catch (error) {
        console.error('Error updating node:', error);
    }
}

// Create edge
async function createEdge(sourceId, targetId) {
    const mutation = `
        mutation CreateEdge($input: CreateEdgeInput!) {
            createEdge(input: $input) {
                id
                source
                target
                label
                color
            }
        }
    `;
    
    const variables = {
        input: {
            boardId,
            source: sourceId,
            target: targetId,
            color: '#95a5a6'
        }
    };
    
    try {
        const data = await graphqlRequest(mutation, variables);
        const edge = data.createEdge;
        
        cy.add({
            group: 'edges',
            data: {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.label || '',
                color: edge.color
            }
        });
    } catch (error) {
        console.error('Error creating edge:', error);
        alert('Error creating edge: ' + error.message);
    }
}

// Delete selected elements
async function deleteSelected() {
    const selected = cy.$(':selected');
    
    for (const element of selected) {
        if (element.isNode()) {
            await deleteNode(element.id());
        } else if (element.isEdge()) {
            await deleteEdge(element.id());
        }
    }
    
    selected.remove();
}

async function deleteNode(nodeId) {
    const mutation = `
        mutation DeleteNode($id: ID!) {
            deleteNode(id: $id)
        }
    `;
    
    try {
        await graphqlRequest(mutation, { id: nodeId });
    } catch (error) {
        console.error('Error deleting node:', error);
    }
}

async function deleteEdge(edgeId) {
    const mutation = `
        mutation DeleteEdge($id: ID!) {
            deleteEdge(id: $id)
        }
    `;
    
    try {
        await graphqlRequest(mutation, { id: edgeId });
    } catch (error) {
        console.error('Error deleting edge:', error);
    }
}

// Share board
async function shareBoard(username, permission) {
    const mutation = `
        mutation ShareBoard($boardId: ID!, $username: String!, $permission: Permission!) {
            shareBoard(boardId: $boardId, username: $username, permission: $permission) {
                id
            }
        }
    `;
    
    const variables = { boardId, username, permission };
    
    try {
        await graphqlRequest(mutation, variables);
        alert('Board shared successfully!');
        closeShareModal();
    } catch (error) {
        console.error('Error sharing board:', error);
        alert('Error sharing board: ' + error.message);
    }
}

// Modal handling
const addNodeModal = document.getElementById('addNodeModal');
const shareModal = document.getElementById('shareModal');
const addNodeBtn = document.getElementById('addNodeBtn');
const shareBtn = document.getElementById('shareBtn');
const deleteBtn = document.getElementById('deleteSelectedBtn');

addNodeBtn.onclick = () => addNodeModal.style.display = 'block';
shareBtn.onclick = () => shareModal.style.display = 'block';
deleteBtn.onclick = deleteSelected;

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        this.closest('.modal').style.display = 'none';
    };
});

window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

function closeShareModal() {
    shareModal.style.display = 'none';
    document.getElementById('shareForm').reset();
}

// Form submissions
document.getElementById('addNodeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const label = document.getElementById('nodeLabel').value;
    createNode(label);
    addNodeModal.style.display = 'none';
    document.getElementById('addNodeForm').reset();
});

document.getElementById('shareForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('shareUsername').value;
    const permission = document.getElementById('sharePermission').value;
    shareBoard(username, permission);
});

// Initialize
if (boardId) {
    initCytoscape();
    loadBoardData();
}

