

import { jsTPS_Transaction } from "jstps";

class CloneSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initSongIndex, initSongClone) {
        super();
        this.app = initApp;
        this.songIndex = initSongIndex;
        this.songClone = initSongClone;
    }

    executeDo() {
        this.app.addSongAt(this.songIndex, this.songClone);
    }

    executeUndo() {
        this.app.deleteSong(this.songIndex + 1);
    }
}

export default CloneSong_Transaction;