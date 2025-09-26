import { jsTPS_Transaction } from "jstps";

export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initSongIndex, oldSongData, newSongData) {
        super();
        this.app = initApp;
        this.songIndex = initSongIndex;
        this.oldSongData = oldSongData;
        this.newSongData = newSongData;
    }

    executeDo() {
        this.app.editSongAt(this.songIndex, this.newSongData);
    }

    executeUndo() {
        this.app.editSongAt(this.songIndex, this.oldSongData);
    }
}
