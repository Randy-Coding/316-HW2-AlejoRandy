import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.currentTarget.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        const cardId = event.currentTarget.id;
        if (!cardId || !cardId.startsWith("song")) {
            return;
        }
        let targetId = cardId.substring(cardId.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        this.props.moveCallback(sourceId, targetId);
    }

    getItemNum = () => {
        return this.props.id.substring("song-card-".length);
    }

    render() {
        const { song, deleteSongCallback, cloneSongCallback } = this.props;
        let num = this.getItemNum();
        let itemClass = "song-card unselected-song-card";
        if (this.state.draggedTo) {
            itemClass = "song-card-dragged-to";
        }
        return (
            <div
            id={'song-' + num}
            className={itemClass}
            onDoubleClick={this.props.onDoubleClick}
            onDragStart={this.handleDragStart}
            onDragOver={this.handleDragOver}
            onDragEnter={this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
            draggable="true"
            >
            <span className="song-card-number">{num}.</span>
            <a
            className="song-card-title"
            href={`https://www.youtube.com/watch?v=${song.youTubeId}`}
            target="_blank"
            rel="noreferrer"
            >
            {song.title}
            </a>
            <span className="song-card-year">({song.year})</span>
            <span className="song-card-artist">{song.artist}</span>
            <input
            id="delete-button"
            type="button"
            className="song-card-button"
            value="🗑"
            onClick={() => deleteSongCallback(num)}
            />
            <input
            type="button"
            className="song-card-button"
            value="+"
            onClick={() => cloneSongCallback(num)}
            />
            </div>
        )
    }
}