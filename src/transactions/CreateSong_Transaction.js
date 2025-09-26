

import { jsTPS_Transaction } from "jstps";

class CreateSong_Transaction extends jsTPS_Transaction {
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

export default CreateSong_Transaction;