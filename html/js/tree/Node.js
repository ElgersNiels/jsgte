GTE.TREE = (function (parentModule) {
    "use strict";

    /**
    * Creates a new Node.
    * @class
    * @param {Node} [parent] Parent node. If null, this is root.
    */
    function Node(parent, reachedBy, iset) {
        this.parent = parent;
        this.children = [];
        this.iset = iset || null;
        this.reachedBy = reachedBy || null;
        if (parent === null) { // If this is root set level to 0
            this.level = 0;
        } else {
            parent.addChild(this);
            this.level = parent.level + 1;
        }

        this.y = this.level * GTE.CONSTANTS.DIST_BETWEEN_LEVELS;
    }

    /**
    * ToString function
    */
    Node.prototype.toString = function nodeToString() {
        return "Node: " + "children.length: " + this.children.length +
               "; level: " + this.level + "; reachedBy: " + this.reachedBy +
               "; iset: " + this.iset;
    };

    /**
    * Function that draws the node in the global canvas
    */
    Node.prototype.draw = function () {
        // The line has to be drawn before so that the circle is drawn on top of it
        if (this.reachedBy !== null) {
            this.reachedBy.draw(this.parent, this);
        }
        var thisNode = this;
        var circle = GTE.canvas.circle(GTE.CONSTANTS.CIRCLE_SIZE)
            .addClass('node')
            .x(this.x)
            .y(this.y)
            .click(function() {
                thisNode.onClick();
            });
    };

    /**
    * Function that defines the behaviour of the node on click
    */
    Node.prototype.onClick = function () {
        if (GTE.MODE === GTE.MODES.ADD){
            // If there are more nodes in the information set
            // Remove the node from the iset since the iset will
            // not be coherent
            if (this.iset.numberOfNodes > 1) {
                console.log("Not alone");
                this.createSingletonISetWithNode();
            }
            console.log(this.iset);
            this.iset.onClick();
        } else {
            GTE.tree.deleteNode(this);
            // // If it is a leaf, delete itself, if not, delete all children
            // if (this.isLeaf()) {
            //     this.delete();
            // } else {
            //     GTE.tree.deleteChildrenOf(this);
            // }
        }
        // Tell the tree to redraw itself
        GTE.tree.draw();
    };


    /**
    * Function that adds child to node
    * @param {Node} node Node to add as child
    * @return {Move} The move that has been created for this child
    */
    Node.prototype.addChild = function (node) {
        this.children.push(node);
        return new GTE.TREE.Move(this, node);
    };

    /**
    * Function that removes child node from children
    * @param {Node} node Child node to remove
    */
    Node.prototype.removeChild = function (nodeToDelete) {
        var indexInList = this.children.indexOf(nodeToDelete);
        if (indexInList > -1) {
            this.children.splice(indexInList, 1);
        }
    };

    /**
    * Function that finds out if node is leaf
    * @return {Boolean} True if is leaf.
    */
    Node.prototype.isLeaf = function () {
        if (this.children.length === 0) {
            return true;
        }
        return false;
    };

    /**
    * Function that changes node's parent to a given one
    * @param {Node} newParent New parent for node
    */
    Node.prototype.changeParent = function (newParent) {
        if (this.parent !== null) {
            this.parent.removeChild(this);
        }
        this.parent = newParent;
        if (this.parent !== null) {
            this.parent.addChild(this);
        }
    };

    /**
    * Function that changes node's iset to a given one
    */
    Node.prototype.createSingletonISetWithNode = function () {
        // Remove current node from given iset
        this.iset.removeNode(this);
        // Create a new iset and add current node to it
        GTE.tree.addNewISet().addNode(this);
        // Add as many moves as node's children
        for (var i = 0; i < this.children.length; i++) {
            console.log(this);
            this.children[i].reachedBy = this.iset.addNewMove();
        }
    };

    /**
    * Function that tells node to delete himself
    */
    Node.prototype.delete = function () {
        // Delete all references to current node
        this.changeParent(null);
        this.iset.removeNode(this);
        this.reachedby = null;
        GTE.tree.positionsUpdated = false;
    };

    // Add class to parent module
    parentModule.Node = Node;

    return parentModule;
}(GTE.TREE)); // Add to GTE.TREE sub-module
