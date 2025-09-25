import { jsTPS_Transaction } from "jstps";

/**
 * DeleteSong_Transaction
 *
 * This class represents a transaction for deleting a song
 * from a playlist. It supports undo/redo by storing the
 * deleted song and its index.
 */
export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initSongIndex, initSong) {
        super();
        this.app = initApp;
        this.songIndex = initSongIndex;
        this.song = initSong; 
    }

    executeDo() {
        this.app.deleteSong(this.songIndex);
    }

    executeUndo() {
        this.app.addSongAt(this.songIndex, this.song);
    }
}