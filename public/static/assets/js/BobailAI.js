class BobailAI {
    constructor(game) {
        this.game = game;
    }

    maxValue(level, state, alpha, beta) {
        //return????????
        let v = -Infinity;

        let childrenState = this.getChildrenState(state);


        childrenState.forEach(childSate => {
            let vChild = minValue(level++, childSate, alpha, beta);

            if (vChild > v) v = vChild;
            if (vChild >= beta) return v;
            if (vChild > alpha) alpha = vChild;
        });
        return v;
    }

    minValue(level, state, alpha, beta) {
        //return????????
        let v = Infinity;

        let childrenState = this.getChildrenState(state);


        childrenState.forEach(childSate => {
            let vChild = maxValue(level++, childSate, alpha, beta);

            if (vChild < v) v = vChild;
            if (vChild <= beta) return v;
            if (vChild < beta) beta = vChild;
        });
        return v;
    }

    getChildrenState(state) {
        //get all the children state of a state
        state = [];
    }

    evaluateState(state) {
        //about the bobail position
        return 0;
    }
}

//TODO

/**Condition de victoire à détecter :
 * Adversaire bloquer ?????
 * Bobail dans le camps
 */