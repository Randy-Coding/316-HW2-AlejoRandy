import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        const { createNewListCallback } = this.props;
        createNewListCallback();
    };

    render() {
        const { canAddPlaylist} = this.props;
        let addPlaylistClass = "toolbar-button";
        if (canAddPlaylist) addPlaylistClass += " disabled";

        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className="toolbar-button" 
                    onClick={this.handleClick}
                    disabled={!canAddPlaylist}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}