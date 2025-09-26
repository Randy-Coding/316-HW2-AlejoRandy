import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import { jsTPS } from 'jstps';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';
import CreateSong_Transaction from './transactions/CreateSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.jsx';
import EditSongModal from './components/EditSongModal.jsx';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.jsx';
import EditToolbar from './components/EditToolbar.jsx';
import SidebarHeading from './components/SidebarHeading.jsx';
import SidebarList from './components/PlaylistCards.jsx';
import SongCards from './components/SongCards.jsx';
import Statusbar from './components/Statusbar.jsx';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            editSongIndex: null,
            isEditModalVisible: false,
            editSongData: { title: "", artist: "", youTubeId: "", year: "" }
        }
    }
    componentDidMount() {
        // Make a copy of the keyNamePairs
        let sortedPairs = [...this.state.sessionData.keyNamePairs];

        // Sort them in place
        this.sortKeyNamePairsByName(sortedPairs);

        // Update state with the sorted pairs
        this.setState(prevState => ({
            ...prevState,
            sessionData: {
                ...prevState.sessionData,
                keyNamePairs: sortedPairs
            }
        }));


        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION CREATES A NEW LIST USING AN EXISTING LIST AS A TEMPLATE
    createNewListFromTemplate = (templateList) => {
        if (!templateList) return;

        // generate new key and name
        let newKey = this.state.sessionData.nextKey;
        let newName = templateList.name + " (Copy)";

        // deep copy the songs so the clone is independent
        let copiedSongs = templateList.songs.map(song => structuredClone(song));

        // build the new list
        let newList = {
            key: newKey,
            name: newName,
            songs: copiedSongs
        };

        // update session key-name pairs
        let newKeyNamePair = { key: newKey, name: newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // update state and persist
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.processTransaction(transaction);
    }
    addDeleteSongTransaction = (index) => {
        let songToDelete = this.state.currentList.songs[index - 1];
        let transaction = new DeleteSong_Transaction(this, index, songToDelete);
        this.tps.processTransaction(transaction);
    }
    addCloneSongTransaction = (index) => {
        // Grab the song we want to clone
        const songToClone = this.state.currentList.songs[index - 1];

        // Create a deep copy
        const clonedSong = structuredClone(songToClone);
        clonedSong.title = `${clonedSong.title} (Copy)`;
        console.log("Cloned Song:", clonedSong);
        const insertIndex = (parseInt(index, 10) + 1).toString();

        let transaction = new CreateSong_Transaction(this, insertIndex, clonedSong);
        this.tps.processTransaction(transaction);
    }
    addCreateSongTransaction = (index) => {
        const placeholderSong = {
            title: "Untitled",
            artist: "Unknown Artist",
            year: "----",
            youTubeId: ""
        };
        let transaction = new CreateSong_Transaction(this, index, placeholderSong);
        this.tps.processTransaction(transaction);
    }

    deleteSong = (index) => {
    this.state.currentList.songs.splice(index - 1, 1); 
    this.setStateWithUpdatedList(this.state.currentList);
    }
    addSongAt = (index, song) => {
        let list = this.state.currentList;
        if (!list) return;

        // Convert from 1-based index (transaction uses 1-based) to 0-based
        const insertAt = Number(index) - 1;

        // Insert song back at the original position
        list.songs.splice(insertAt, 0, song);

        this.setStateWithUpdatedList(list);
    };

    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToDo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    cloneList = (keyNamePair) => {
        // Find the key-name pair
        let originalPair = this.state.sessionData.keyNamePairs.find(
            pair => pair.key === keyNamePair.key
        );
        if (!originalPair) return;

        // Load the full list object from DB
        let list = this.db.queryGetList(originalPair.key);
        if (!list) return;

        // Reuse your template method
        this.createNewListFromTemplate(list);
    };
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");

        // Disable toolbar buttons
        document.getElementById("add-list-button").disabled = true;
        document.getElementById("add-song-button").disabled = true;
        document.getElementById("undo-button").disabled = true;
        document.getElementById("redo-button").disabled = true;
        document.getElementById("close-button").disabled = true;
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");

        // Re-enable toolbar buttons
        document.getElementById("add-list-button").disabled = false;
        document.getElementById("add-song-button").disabled = false;
        document.getElementById("undo-button").disabled = !this.tps.hasTransactionToUndo();
        document.getElementById("redo-button").disabled = !this.tps.hasTransactionToDo();
        document.getElementById("close-button").disabled = false;
    };

    openEditSongModal = (index) => {
        const song = this.state.currentList.songs[index];
        document.getElementById("add-list-button").disabled = true;
        document.getElementById("add-song-button").disabled = true;
        document.getElementById("undo-button").disabled = true;
        document.getElementById("redo-button").disabled = true;
        document.getElementById("close-button").disabled = true;
        this.setState({
            editSongIndex: index,
            editSongData: { title: song.title, artist: song.artist, youTubeId: song.youTubeId, year: song.year },
            isEditModalVisible: true
        });
    }

    closeEditSongModal = () => {
        this.setState({ isEditModalVisible: false });
        document.getElementById("add-list-button").disabled = false;
        document.getElementById("add-song-button").disabled = false;
        document.getElementById("undo-button").disabled = !this.tps.hasTransactionToUndo();
        document.getElementById("redo-button").disabled = !this.tps.hasTransactionToDo();
        document.getElementById("close-button").disabled = false;
    }

    editSongAt(index, songData) {
        let list = this.state.currentList;
        if (!list) return;
        if (index < 0 || index >= list.songs.length) return;
        list.songs[index] = { ...songData };
        this.setStateWithUpdatedList(list);
    }

    confirmEditSongModal = () => {
        let index = this.state.editSongIndex;
        let oldSongData = this.state.currentList.songs[index];
        let newSongData = { ...this.state.editSongData };

        let transaction = new EditSong_Transaction(this, index, oldSongData, newSongData);
        this.tps.processTransaction(transaction);

        this.closeEditSongModal();
    }


    handleKeyDown = (event) => {
        // Check undo (Ctrl+Z or Cmd+Z)
        const undoBtn = document.getElementById("undo-button");
        const redoBtn = document.getElementById("redo-button");

        if (undoBtn.disabled) {
            console.log("The undo button is disabled!");
        } else {
            console.log("The undo button is enabled!");
        }

        if (redoBtn.disabled) {
            console.log("The redo button is disabled!");
        } else {
            console.log("The redo button is enabled!");
        }
        if ((event.ctrlKey || event.metaKey) && event.key === "z") {
            const undoBtn = document.getElementById("undo-button");
            if (undoBtn && !undoBtn.disabled && this.tps.hasTransactionToUndo()) {
                this.undo();
                event.preventDefault();
            }
        }

        // Check redo (Ctrl+Y or Cmd+Y)
        if ((event.ctrlKey || event.metaKey) && event.key === "y") {
            const redoBtn = document.getElementById("redo-button");
            if (redoBtn && !redoBtn.disabled && this.tps.hasTransactionToDo()) {
                this.redo();
                event.preventDefault();
            }
        }
    };

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToDo();
        let canClose = this.state.currentList !== null;
        let canAddPlaylist = true;
        return (
            <div id="outer-root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddPlaylist={canAddPlaylist}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    cloneListCallback={this.cloneList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    createSongCallback={this.addCreateSongTransaction}
                />
                <SongCards
                currentList={this.state.currentList}
                moveSongCallback={this.addMoveSongTransaction}
                openEditSongModal={this.openEditSongModal}
                deleteSongCallback={this.addDeleteSongTransaction}
                cloneSongCallback={this.addCloneSongTransaction}
                />                
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    isVisible={this.state.isEditModalVisible}
                    song={this.state.editSongData}
                    onChange={(e) => this.setState({ editSongData: { ...this.state.editSongData, [e.target.name]: e.target.value } })}
                    onCancel={this.closeEditSongModal}
                    onConfirm={this.confirmEditSongModal}
                />
            </div>
        );
    }
}

export default App;
