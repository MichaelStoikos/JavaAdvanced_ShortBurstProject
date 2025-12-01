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

// WebSocket connection for real-time updates
let ws = null;
let subscriptionId = 0;
const subscriptions = new Map();

// Track locally created items to avoid duplicate adds from subscriptions
const locallyCreatedNodes = new Set();
const locallyCreatedEdges = new Set();

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/graphql-ws`;
    
    ws = new WebSocket(wsUrl, 'graphql-transport-ws');
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        // Send connection init
        ws.send(JSON.stringify({ type: 'connection_init' }));
    };
    
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'connection_ack') {
            console.log('WebSocket connection acknowledged');
            // Subscribe to node and edge changes
            subscribeToNodeChanges();
            subscribeToEdgeChanges();
        } else if (message.type === 'next' && message.id) {
            const handler = subscriptions.get(message.id);
            if (handler) {
                handler(message.payload.data);
            }
        } else if (message.type === 'error') {
            console.error('WebSocket error:', message.payload);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting in 3s...');
        setTimeout(connectWebSocket, 3000);
    };
}

function subscribe(query, variables, handler) {
    const id = String(++subscriptionId);
    subscriptions.set(id, handler);
    
    ws.send(JSON.stringify({
        id,
        type: 'subscribe',
        payload: {
            query,
            variables
        }
    }));
    
    return id;
}

function subscribeToNodeChanges() {
    const query = `
        subscription NodeChanged($boardId: ID!) {
            nodeChanged(boardId: $boardId) {
                node {
                    id
                    label
                    x
                    y
                    color
                    shape
                    size
                }
                nodeId
                changeType
            }
        }
    `;
    
    subscribe(query, { boardId }, (data) => {
        const change = data.nodeChanged;
        console.log('Node change received:', change);
        
        if (change.changeType === 'CREATED' && change.node) {
            // Skip if we just created this node locally
            if (locallyCreatedNodes.has(change.node.id)) {
                locallyCreatedNodes.delete(change.node.id);
                return;
            }
            
            // Add new node if it doesn't exist
            if (!cy.getElementById(change.node.id).length) {
                cy.add({
                    group: 'nodes',
                    data: {
                        id: change.node.id,
                        label: change.node.label,
                        color: change.node.color || '#3498db',
                        shape: change.node.shape || 'ellipse',
                        size: change.node.size || 50
                    },
                    position: { x: change.node.x, y: change.node.y }
                });
            }
        } else if (change.changeType === 'UPDATED' && change.node) {
            // Update existing node
            const node = cy.getElementById(change.node.id);
            if (node.length) {
                node.data('label', change.node.label);
                node.data('color', change.node.color);
                node.data('shape', change.node.shape);
                node.data('size', change.node.size);
                node.position({ x: change.node.x, y: change.node.y });
            }
        } else if (change.changeType === 'DELETED') {
            // Remove deleted node
            cy.getElementById(change.nodeId).remove();
        }
    });
}

function subscribeToEdgeChanges() {
    const query = `
        subscription EdgeChanged($boardId: ID!) {
            edgeChanged(boardId: $boardId) {
                edge {
                    id
                    source
                    target
                    label
                    color
                }
                edgeId
                changeType
            }
        }
    `;
    
    subscribe(query, { boardId }, (data) => {
        const change = data.edgeChanged;
        console.log('Edge change received:', change);
        
        if (change.changeType === 'CREATED' && change.edge) {
            // Skip if we just created this edge locally
            if (locallyCreatedEdges.has(change.edge.id)) {
                locallyCreatedEdges.delete(change.edge.id);
                return;
            }
            
            // Add new edge if it doesn't exist
            if (!cy.getElementById(change.edge.id).length) {
                cy.add({
                    group: 'edges',
                    data: {
                        id: change.edge.id,
                        source: change.edge.source,
                        target: change.edge.target,
                        label: change.edge.label || '',
                        color: change.edge.color || '#95a5a6'
                    }
                });
            }
        } else if (change.changeType === 'UPDATED' && change.edge) {
            // Update existing edge
            const edge = cy.getElementById(change.edge.id);
            if (edge.length) {
                edge.data('label', change.edge.label);
                edge.data('color', change.edge.color);
            }
        } else if (change.changeType === 'DELETED') {
            // Remove deleted edge
            cy.getElementById(change.edgeId).remove();
        }
    });
}

// Initialize Cytoscape
let cy;
let connectMode = false;
let connectSourceNode = null;

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
            },
            {
                selector: '.connect-source',
                style: {
                    'border-width': 4,
                    'border-color': '#00ff00',
                    'border-style': 'dashed'
                }
            },
            {
                selector: '.connect-hover',
                style: {
                    'border-width': 3,
                    'border-color': '#ffff00'
                }
            }
        ],
        layout: {
            name: 'preset'
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true,
        wheelSensitivity: 0.1  // Reduce mouse wheel zoom sensitivity (default is 1)
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
    
    // Context menu for creating edges (right-click method)
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
    
    // Connect mode click handler
    cy.on('tap', 'node', function(evt) {
        if (!connectMode) return;
        
        const node = evt.target;
        
        if (!connectSourceNode) {
            // First click - select source
            connectSourceNode = node;
            cy.nodes().removeClass('connect-source');
            node.addClass('connect-source');
        } else if (connectSourceNode.id() === node.id()) {
            // Clicked same node - deselect
            connectSourceNode = null;
            cy.nodes().removeClass('connect-source');
        } else {
            // Second click - create edge
            createEdge(connectSourceNode.id(), node.id());
            cy.nodes().removeClass('connect-source');
            connectSourceNode = null;
        }
    });
    
    // Hover effect in connect mode
    cy.on('mouseover', 'node', function(evt) {
        if (connectMode && connectSourceNode && evt.target.id() !== connectSourceNode.id()) {
            evt.target.addClass('connect-hover');
        }
    });
    
    cy.on('mouseout', 'node', function(evt) {
        evt.target.removeClass('connect-hover');
    });
    
    // Update zoom level display when zoom changes
    cy.on('zoom', function() {
        updateZoomDisplay();
    });
}

// Zoom control functions
function updateZoomDisplay() {
    const zoom = cy.zoom();
    const zoomPercent = Math.round(zoom * 100);
    document.getElementById('zoomLevel').textContent = zoomPercent + '%';
}

function zoomIn() {
    const currentZoom = cy.zoom();
    const newZoom = currentZoom * 1.2; // 20% increase
    cy.zoom({
        level: newZoom,
        renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
    });
}

function zoomOut() {
    const currentZoom = cy.zoom();
    const newZoom = currentZoom * 0.8; // 20% decrease
    cy.zoom({
        level: newZoom,
        renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
    });
}

function zoomFit() {
    cy.fit(null, 50); // Fit all elements with 50px padding
}

function zoomReset() {
    cy.zoom(1);
    cy.center();
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
        
        // Mark as locally created to ignore subscription event
        locallyCreatedNodes.add(node.id);
        console.log('Created node locally, added to ignore list:', node.id);
        
        // Check if node already exists before adding
        if (!cy.getElementById(node.id).length) {
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
        } else {
            console.warn('Node already exists, skipping add:', node.id);
        }
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
        
        // Mark as locally created to ignore subscription event
        locallyCreatedEdges.add(edge.id);
        console.log('Created edge locally, added to ignore list:', edge.id);
        
        // Check if edge already exists before adding
        if (!cy.getElementById(edge.id).length) {
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
        } else {
            console.warn('Edge already exists, skipping add:', edge.id);
        }
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
const connectModeBtn = document.getElementById('connectModeBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomFitBtn = document.getElementById('zoomFitBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

addNodeBtn.onclick = () => addNodeModal.style.display = 'block';
shareBtn.onclick = () => shareModal.style.display = 'block';
deleteBtn.onclick = deleteSelected;

// Zoom controls
zoomInBtn.onclick = zoomIn;
zoomOutBtn.onclick = zoomOut;
zoomFitBtn.onclick = zoomFit;
zoomResetBtn.onclick = zoomReset;

// Connect mode toggle
connectModeBtn.onclick = () => {
    connectMode = !connectMode;
    
    if (connectMode) {
        connectModeBtn.textContent = '🔗 Connect Mode: ON';
        connectModeBtn.classList.remove('btn-secondary');
        connectModeBtn.classList.add('btn-primary');
        connectModeBtn.style.backgroundColor = '#28a745';
        cy.nodes().removeClass('connect-source');
        connectSourceNode = null;
    } else {
        connectModeBtn.textContent = '🔗 Connect Mode: OFF';
        connectModeBtn.classList.remove('btn-primary');
        connectModeBtn.classList.add('btn-secondary');
        connectModeBtn.style.backgroundColor = '';
        cy.nodes().removeClass('connect-source');
        connectSourceNode = null;
    }
};

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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Plus: Zoom in
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
    }
    // Ctrl/Cmd + Minus: Zoom out
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
    }
    // Ctrl/Cmd + 0: Reset zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        zoomReset();
    }
    // F: Fit to screen
    if (e.key === 'f' || e.key === 'F') {
        if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            zoomFit();
        }
    }
    // Delete/Backspace: Delete selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.matches('input, textarea')) {
        e.preventDefault();
        deleteSelected();
    }
});

// Initialize
if (boardId) {
    initCytoscape();
    loadBoardData().then(() => {
        // Update zoom display after loading
        updateZoomDisplay();
    });
    // Connect WebSocket for real-time updates
    connectWebSocket();
}

