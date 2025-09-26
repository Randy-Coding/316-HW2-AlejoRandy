

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
        const list = this.app.state.currentList;
        this.app.deleteSong(this.songIndex);
    }
}

export default CreateSong_Transaction;