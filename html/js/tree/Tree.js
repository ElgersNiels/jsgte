GTE.TREE = (function (parentModule) {
    "use strict";

    /**
    * Creates a new Tree.
    * @class
    * @param {Node} root Root node for the tree
    */
    function Tree(root) {
        this.root = root;
        this.positionsUpdated = false;
        this.isets = [];
    }

    /**
    * Function that draws the Game in the global canvas
    * Takes care of updating the positions, clearing the canvas and drawing in it
    */
    Tree.prototype.draw = function(){
        if (!this.positionsUpdated) {
            this.updatePositions();
        }
        this.clear();
        this.drawISets();
        this.drawNodes();
    };

    Tree.prototype.clear = function(){
        // Clear canvas
        GTE.canvas.clear();
        // Remove labels
        var foreigns = document.getElementsByTagName("foreignObject");
        for (var index = foreigns.length - 1; index >= 0; index--) {
            foreigns[index].parentNode.removeChild(foreigns[index]);
        }
    };


    /**
    * Function that draws the isets in the global canvas by calling the drawing
    * function of each of the isets in the game
    */
    Tree.prototype.drawISets = function () {
        for (var i = 0; i < this.isets.length; i++) {
            this.isets[i].draw();
        }
    };

    /**
    * Function that draws the nodes in the global canvas by calling the recursive
    * function that goes along the tree drawing each node
    */
    Tree.prototype.drawNodes = function () {
        this.recursiveDrawNodes(this.root);
    };

    /**
    * Recursive function that draws the Game in the global canvas starting from a node
    * If no param is given it will start from root
    * Stopping criteria: that the current node is a leaf
    * Recursive expansion: to all of the node's children
    * @param {Node} [node] Node to start drawing from
    */
    Tree.prototype.recursiveDrawNodes = function (node) {
        // In case there is no arguments start from root
        if (node === undefined) { node = this.root; }

        if (!node.isLeaf()) {
            for (var i = 0; i < node.children.length; i++) {
                this.recursiveDrawNodes(node.children[i]);
            }
        }
        node.draw();
    };

    /**
    * Function that returns the number of leaves in the tree
    * @return {Number} leafCounter Number of Leaves
    */
    Tree.prototype.numberLeaves = function () {
        return this.leaves.length;
    };

    /**
    * Function that updates the different structures used while drawing
    */
    Tree.prototype.updateDataStructures = function () {
        this.leaves = [];
        this.nodesByLevel = [];
        this.isetsByLevel = [];
        this.leavesByLevel = [];
        this.recursiveUpdateDataStructures(this.root);
    };

    /**
    * Recursive function that updates the data structures used while drawing
    * Stopping criteria: that the current node is a leaf
    * Recursive expansion: to all of the node's children
    * @param    {Node}      node        Node to start from
    */
    Tree.prototype.recursiveUpdateDataStructures = function (node) {
        if (this.nodesByLevel[node.level] === undefined) {
            this.nodesByLevel[node.level] = [];
        }
        this.nodesByLevel[node.level].push(node);
        if (this.isetsByLevel[node.level] === undefined) {
            this.isetsByLevel[node.level] = [];
        }
        this.isetsByLevel[node.level].push(node.iset);
        if (this.leavesByLevel[node.level] === undefined) {
            this.leavesByLevel[node.level] = [];
        }
        if (node.isLeaf()) {
            this.leavesByLevel[node.level].push(node);
            this.leaves.push(node);
        } else {
            for (var i = 0; i < node.children.length; i++) {
                this.recursiveUpdateDataStructures(node.children[i]);
            }
        }
    };

    /**
    * Function that updates the positions of the nodes in the tree
    */
    Tree.prototype.updatePositions = function () {
        this.updateDataStructures();
        this.updateLeavesPositions();
        this.recursiveUpdatePositions(this.root);
        this.recursiveCheckForCollisions(this.root);
        this.positionsUpdated = true;
    };

    /**
    * Recursive function that updates the positions of the children nodes.
    * Leaves positions are updated in a different function.
    * Stopping criteria: that the current node is a leaf
    * Recursive expansion: to all of the node's children
    * @param {Node} node Node that will get their children's positions updated
    */
    Tree.prototype.recursiveUpdatePositions = function (node) {
        if (!node.isLeaf()) {
            for (var i = 0; i < node.children.length; i++) {
                this.recursiveUpdatePositions(node.children[i]);
            }
            // Get middle point between the children most in the left and most
            // in the right
            // TODO: apply level weighted function for special cases
            node.x = node.children[0].x +
                (node.children[node.children.length-1].x - node.children[0].x)/2;
            node.y = node.level * GTE.CONSTANTS.DIST_BETWEEN_LEVELS;
        }
    };

    /**
    * Recursive function that checks for collisions between leaves and isets.
    * It checks if any leaf is positioned between first and last node of the iset
    * In that case, it will move everything down so that the leaves don't collide
    * Stopping criteria: that the current node is a leaf
    * Recursive expansion: to all of the node's children
    * @param {Node} node Node that will be checked
    */
    Tree.prototype.recursiveCheckForCollisions = function (node) {
        if (!node.isLeaf()) {
            for (var i = 0; i < node.children.length; i++) {
                this.recursiveCheckForCollisions(node.children[i]);
            }
            // It is only needed to check if current node is the last one
            // in its iset
            if (node.iset.lastNode === node) {
                // Check if iset collides with any leaf at same level
                for (i = 0; i < this.leavesByLevel[node.level].length; i++) {
                    // If leaf is positioned between first node and last node
                    if (node.iset.firstNode.x < this.leavesByLevel[node.level][i].x &&
                        this.leavesByLevel[node.level][i].x < node.x) {
                        // If it collides move everything below a little bit down
                        this.moveDownEverythingBelow(node.iset);
                        // Only one collision is sufficient to move everything
                        break;
                    }

                }
            }
        }
    };

    /**
    * Function that will move everything below a given iset a little bit down
    */
    Tree.prototype.moveDownEverythingBelow = function (iset) {
        var nodesInIset = this.getNodesThatBelongTo(iset);
        for (var i = 0; i < nodesInIset.length; i++) {
            this.recursiveMoveDownEverythingBelow(nodesInIset[i]);
        }
    };

    /**
    * Recursive function that moves everything below down
    * Stopping criteria: that the current node is a leaf
    * Recursive expansion: to all of the node's children
    * @param {Node} node Node that will be moved
    */
    Tree.prototype.recursiveMoveDownEverythingBelow = function (node) {
        node.y += 50;
        if (!node.isLeaf()) {
            for (var i = 0; i < node.children.length; i++) {
                this.recursiveMoveDownEverythingBelow(node.children[i]);
            }
        }
    };

    /**
    * Updates the positions (x and y) of the Tree leaves
    */
    Tree.prototype.updateLeavesPositions = function () {
        var numberLeaves = this.numberLeaves();
        var widthPerNode = GTE.canvas.viewbox().width/numberLeaves;
        var offset = 0;
        // Avoid nodes to be too spreaded out
        if (widthPerNode > GTE.CONSTANTS.MAX_HORIZONTAL_DISTANCE_BW_NODES) {
            widthPerNode = GTE.CONSTANTS.MAX_HORIZONTAL_DISTANCE_BW_NODES;
            // Calculate the offset so the nodes are centered on the screen
            offset = (GTE.canvas.viewbox().width-widthPerNode*numberLeaves)/2;
        }
        if (widthPerNode < GTE.CONSTANTS.CIRCLE_SIZE) {
            this.zoomOut();
            this.updateLeavesPositions();
        } else {
            for (var i = 0; i < numberLeaves; i++) {
                this.leaves[i].x = (widthPerNode*i)+(widthPerNode/2) -
                                        GTE.CONSTANTS.CIRCLE_SIZE/2 + offset;
                this.leaves[i].y = this.leaves[i].level * GTE.CONSTANTS.DIST_BETWEEN_LEVELS;
            }
        }
    };

    /**
    * Function that adds a new information set to the tree. It creates it and
    * adds it to the list of isets
    * @return {ISet} newISet New information set that has been created
    */
    Tree.prototype.addNewISet = function () {
        var newISet = new GTE.TREE.ISet();
        this.isets.push(newISet);
        return newISet;
    };

    /**
    * Function that adds a new node to the tree. It creates it and checks
    * if the node is the first or last in its information set
    * @param {Node} parent Node that will be set as parent to the new one
    * @param {Move} reachedby Move that leads to this new node
    * @param {ISet} iset Information set that will contain it
    * @return {Node} newNode New node that has been created
    */
    Tree.prototype.addNewNode = function (parent, reachedby, iset) {
        var newNode = new GTE.TREE.Node(parent, reachedby, iset);
        var nodesInIset = this.getNodesThatBelongTo(iset);

        // Update first and last one
        iset.firstNode = nodesInIset[0];
        iset.lastNode = nodesInIset[nodesInIset.length-1];
        this.positionsUpdated = false;
        return newNode;
    };

    // /**
    // * Adds a child to a given node
    // * @param  {Node} parentNode Node that will get a new child
    // * @return {Node} newNode    Node that has been added
    // */
    // Tree.prototype.addChildNodeTo = function (parentNode) {
    //     // Create a new move in parent ISet
    //     var newMove = parentNode.iset.addNewMove();
    //
    //     // Create a new Iset with only one node
    //     var newISet = this.addNewISet();
    //
    //     var newNode = new GTE.TREE.Node(parentNode, newMove, newISet);
    //
    //     if ((newNode.y + GTE.CONSTANTS.CIRCLE_SIZE) > GTE.canvas.viewbox().height) {
    //         this.zoomOut();
    //     }
    //     this.positionsUpdated = false;
    //     return newNode;
    // };

    /**
    * Creates two new moves for a given ISet and the new ISet that
    * the moves will lead to
    * @param  {ISet} parentISet ISet that will get two new moves
    */
    Tree.prototype.addChildISetTo = function (parentISet) {
        // Create new information set
        var newISet = this.addNewISet();

        // Get nodes that belong to parentISet as isets don't keep reference of nodes
        var nodesInParentISet = this.getNodesThatBelongTo(parentISet);
        parentISet.addChildISet(newISet, nodesInParentISet);
        this.positionsUpdated = false;
    };

    Tree.prototype.addNodesToChildISet = function (parent, child) {
        var newMove = parent.addNewMove();
        console.log("newMove " + newMove);
        var nodesInParentISet = this.getNodesThatBelongTo(parent);
        for (var i = 0; i < nodesInParentISet.length; i++) {
            this.addNewNode(nodesInParentISet[i], newMove, child || this.addNewISet());
        }
        console.log(parent.moves);
        this.positionsUpdated = false;
    };

    /**
     * Function that deletes the node. It changes children's parent to their
     * grandparent.
     * @param {Node} node Node to be deleted
     */
    Tree.prototype.deleteChildrenOf = function (node) {
        // Delete everything below every child
        while(node.children.length !== 0){
            this.recursiveDeleteChildren(node.children[0]);
        }
        this.positionsUpdated = false;
    };

    /**
    * Recursive function that deletes everything below a node.
    * Stopping criteria: that the current node is a leaf
    * Recursive expansion: to all of the node's children
    * @param {Node} node Starting node
    */
    Tree.prototype.recursiveDeleteChildren = function (node) {
        if (!node.isLeaf()) {
            for (var i=0; i < node.children.length; i++) {
                this.recursiveDeleteChildren(node.children[i]);
            }
        }
        node.delete();
    };

    /**
    * Zooms out the canvas by making the viewbox bigger
    */
    Tree.prototype.zoomOut = function(){
        GTE.canvas.viewbox(0, 0, GTE.canvas.viewbox().width*1.5, GTE.canvas.viewbox().height*1.5);
    };


    Tree.prototype.getNodesThatBelongTo = function(iset) {
        var returnArray = [];
        this.recursiveGetNodesThatBelongTo(this.root, iset, returnArray);
        return returnArray;
    };

    Tree.prototype.recursiveGetNodesThatBelongTo = function(node, iset, returnArray) {
        if (node.iset === iset) {
            returnArray.push(node);
        }
        if (!node.isLeaf()) {
            for (var i = 0; i < node.children.length; i++) {
                this.recursiveGetNodesThatBelongTo(node.children[i], iset, returnArray);
            }
        }
    };

    Tree.prototype.getNextMoveName = function () {
        // Get all moves
        var listOfMoves = this.getAllMoves();
        if (listOfMoves.length === 0) return "A";
        var lastMove = listOfMoves[listOfMoves.length-1];
        var name = lastMove.name.substring(0, lastMove.name.length-1) +
               String.fromCharCode(lastMove.name.charCodeAt(lastMove.name.length-1) + 1);
        return name;
    };

    Tree.prototype.getAllMoves = function () {
        var listOfMoves = [];
        for (var i = 0; i < this.isets.length; i++) {
            for (var j = 0; j < this.isets[i].moves.length; j++) {
                listOfMoves.push(this.isets[i].moves[j]);
            }
        }
        listOfMoves.sort(GTE.TREE.Move.compare);
        return listOfMoves;
    };

    Tree.prototype.getChildrenNodes = function (iset) {
        // Get the nodes that belong to given iset
        var nodesInIset = this.getNodesThatBelongTo(iset);

        var children = [];
        // Iterate over nodes and get their children
        for (var i = 0; i < nodesInIset.length; i++) {
            for (var j = 0; j < nodesInIset[i].children.length; j++) {
                children.push(nodesInIset[i].children[j]);
            }
        }
        return children;
    };

    // Add class to parent module
    parentModule.Tree = Tree;

    return parentModule;
}(GTE.TREE)); // Add to GTE.TREE sub-module
