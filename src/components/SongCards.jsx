import SongCard from './SongCard.jsx';
import React from "react";

export default class SongCards extends React.Component {
    render() {
        const { currentList, moveSongCallback, openEditSongModal, deleteSongCallback, cloneSongCallback } = this.props;
        if (currentList === null) {
            return (
                <div id="song-cards"></div>
            )
        }
        else {
            return (
                <div id="song-cards">
                    {
                        currentList.songs.map((song, index) => (
                        <SongCard
                        id={'song-card-' + (index + 1)}
                        key={'song-card-' + (index + 1)}
                        song={song}
                        moveCallback={moveSongCallback}
                        onDoubleClick={() => openEditSongModal(index)}
                        deleteSongCallback={deleteSongCallback}
                        cloneSongCallback={cloneSongCallback}
                        />
                        ))
                    }
                </div>
            )
        }
    }
}