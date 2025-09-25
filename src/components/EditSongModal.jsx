

import React, { Component } from 'react';

/**
 * EditSongModal component renders a modal dialog for editing a song.
 * Props:
 * - isVisible: boolean, whether the modal is visible
 * - song: { title, artist, youTubeId, year }
 * - onConfirm: function, called when confirm button is clicked
 * - onCancel: function, called when cancel button is clicked
 * - onChange: function, called when any input changes
 */
const EditSongModal = ({ isVisible, song, onConfirm, onCancel, onChange }) => {
    return (
        <div
            id="edit-song-modal"
            className={`modal${isVisible ? " is-visible" : ""}`}
        >
            <div className="modal-root">
                <form id="edit-song-form" onSubmit={e => { e.preventDefault(); onConfirm(); }}>
                    <div className="modal-north">Edit Song</div>
                    <div className="modal-center">
                        <div className="modal-center-content">
                            <div className="modal-input-row">
                                <label htmlFor="edit-song-modal-title-textfield">Title:</label>
                                <input
                                    id="edit-song-modal-title-textfield"
                                    className="modal-textfield"
                                    type="text"
                                    name="title"
                                    value={song.title}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="modal-input-row">
                                <label htmlFor="edit-song-modal-artist-textfield">Artist:</label>
                                <input
                                    id="edit-song-modal-artist-textfield"
                                    className="modal-textfield"
                                    type="text"
                                    name="artist"
                                    value={song.artist}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="modal-input-row">
                                <label htmlFor="edit-song-modal-youTubeId-textfield">YouTube Id:</label>
                                <input
                                    id="edit-song-modal-youTubeId-textfield"
                                    className="modal-textfield"
                                    type="text"
                                    name="youTubeId"
                                    value={song.youTubeId}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="modal-input-row">
                                <label htmlFor="edit-song-modal-year-textfield">Year:</label>
                                <input
                                    id="edit-song-modal-year-textfield"
                                    className="modal-textfield"
                                    type="text"
                                    name="year"
                                    value={song.year}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-south">
                        <input
                            id="edit-song-confirm-button"
                            className="modal-button"
                            type="submit"
                            value="Confirm"
                        />
                        <input
                            id="edit-song-cancel-button"
                            className="modal-button"
                            type="button"
                            value="Cancel"
                            onClick={onCancel}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSongModal;