// Node Resize Extension for Cytoscape
// Adds resize handles to selected nodes

let resizeHandles = null;
let isResizing = false;
let resizeStartPos = null;
let resizeStartSize = null;
let resizingNode = null;
let resizeHandle = null;

function initNodeResize(cy) {
    // Add resize handles overlay
    const container = cy.container();
    const resizeOverlay = document.createElement('div');
    resizeOverlay.id = 'resize-overlay';
    resizeOverlay.style.position = 'absolute';
    resizeOverlay.style.top = '0';
    resizeOverlay.style.left = '0';
    resizeOverlay.style.width = '100%';
    resizeOverlay.style.height = '100%';
    resizeOverlay.style.pointerEvents = 'none';
    resizeOverlay.style.zIndex = '999';
    container.appendChild(resizeOverlay);
    
    resizeHandles = resizeOverlay;
    
    // Update handles when node is selected
    cy.on('select', 'node', function(evt) {
        if (!isResizing) {
            updateResizeHandles(cy, evt.target);
        }
    });
    
    cy.on('unselect', 'node', function() {
        if (!isResizing) {
            clearResizeHandles();
        }
    });
    
    // Update handles on zoom/pan
    cy.on('zoom pan', function() {
        const selected = cy.$('node:selected');
        if (selected.length === 1 && !isResizing) {
            updateResizeHandles(cy, selected[0]);
        }
    });
    
    // Clear handles when clicking background
    cy.on('tap', function(evt) {
        if (evt.target === cy) {
            clearResizeHandles();
        }
    });
}

function updateResizeHandles(cy, node) {
    clearResizeHandles();
    
    const bb = node.renderedBoundingBox();
    const handleSize = 12;
    const handleOffset = handleSize / 2;
    
    // Create 8 resize handles (corners and sides)
    const handles = [
        { pos: 'nw', x: bb.x1, y: bb.y1, cursor: 'nw-resize' },
        { pos: 'n', x: (bb.x1 + bb.x2) / 2, y: bb.y1, cursor: 'n-resize' },
        { pos: 'ne', x: bb.x2, y: bb.y1, cursor: 'ne-resize' },
        { pos: 'e', x: bb.x2, y: (bb.y1 + bb.y2) / 2, cursor: 'e-resize' },
        { pos: 'se', x: bb.x2, y: bb.y2, cursor: 'se-resize' },
        { pos: 's', x: (bb.x1 + bb.x2) / 2, y: bb.y2, cursor: 's-resize' },
        { pos: 'sw', x: bb.x1, y: bb.y2, cursor: 'sw-resize' },
        { pos: 'w', x: bb.x1, y: (bb.y1 + bb.y2) / 2, cursor: 'w-resize' }
    ];
    
    handles.forEach(handle => {
        const handleEl = document.createElement('div');
        handleEl.className = 'resize-handle';
        handleEl.dataset.position = handle.pos;
        handleEl.style.position = 'absolute';
        handleEl.style.left = (handle.x - handleOffset) + 'px';
        handleEl.style.top = (handle.y - handleOffset) + 'px';
        handleEl.style.width = handleSize + 'px';
        handleEl.style.height = handleSize + 'px';
        handleEl.style.backgroundColor = '#fff';
        handleEl.style.border = '2px solid #667eea';
        handleEl.style.borderRadius = '50%';
        handleEl.style.cursor = handle.cursor;
        handleEl.style.pointerEvents = 'auto';
        handleEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        // Mouse events for resizing
        handleEl.addEventListener('mousedown', (e) => startResize(e, cy, node, handle.pos));
        
        resizeHandles.appendChild(handleEl);
    });
}

function clearResizeHandles() {
    if (resizeHandles) {
        resizeHandles.innerHTML = '';
    }
}

function startResize(e, cy, node, position) {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing = true;
    resizingNode = node;
    resizeHandle = position;
    resizeStartPos = { x: e.clientX, y: e.clientY };
    resizeStartSize = {
        width: node.data('width') || 80,
        height: node.data('height') || 50
    };
    
    // Disable cytoscape interactions during resize
    cy.userPanningEnabled(false);
    cy.boxSelectionEnabled(false);
    
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
    
    // Add resizing class
    document.body.style.cursor = e.target.style.cursor;
}

function onResizeMove(e) {
    if (!isResizing || !resizingNode) return;
    
    const dx = e.clientX - resizeStartPos.x;
    const dy = e.clientY - resizeStartPos.y;
    
    // Calculate new size based on handle position and zoom
    const zoom = cy.zoom();
    const scaledDx = dx / zoom;
    const scaledDy = dy / zoom;
    
    let newWidth = resizeStartSize.width;
    let newHeight = resizeStartSize.height;
    
    // Calculate new dimensions based on which handle is being dragged
    switch (resizeHandle) {
        case 'nw':
            newWidth = Math.max(20, resizeStartSize.width - scaledDx);
            newHeight = Math.max(20, resizeStartSize.height - scaledDy);
            break;
        case 'n':
            newHeight = Math.max(20, resizeStartSize.height - scaledDy);
            break;
        case 'ne':
            newWidth = Math.max(20, resizeStartSize.width + scaledDx);
            newHeight = Math.max(20, resizeStartSize.height - scaledDy);
            break;
        case 'e':
            newWidth = Math.max(20, resizeStartSize.width + scaledDx);
            break;
        case 'se':
            newWidth = Math.max(20, resizeStartSize.width + scaledDx);
            newHeight = Math.max(20, resizeStartSize.height + scaledDy);
            break;
        case 's':
            newHeight = Math.max(20, resizeStartSize.height + scaledDy);
            break;
        case 'sw':
            newWidth = Math.max(20, resizeStartSize.width - scaledDx);
            newHeight = Math.max(20, resizeStartSize.height + scaledDy);
            break;
        case 'w':
            newWidth = Math.max(20, resizeStartSize.width - scaledDx);
            break;
    }
    
    // Update node size
    resizingNode.data('width', Math.round(newWidth));
    resizingNode.data('height', Math.round(newHeight));
    
    // Update resize handles
    updateResizeHandles(cy, resizingNode);
}

function onResizeEnd(e) {
    if (!isResizing || !resizingNode) return;
    
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
    
    // Re-enable cytoscape interactions
    cy.userPanningEnabled(true);
    cy.boxSelectionEnabled(true);
    
    document.body.style.cursor = '';
    
    // Save the new size to backend
    const newWidth = resizingNode.data('width');
    const newHeight = resizingNode.data('height');
    
    if (typeof updateNode === 'function') {
        updateNode(resizingNode.id(), { 
            width: newWidth, 
            height: newHeight 
        });
    }
    
    isResizing = false;
    resizingNode = null;
    resizeHandle = null;
}

