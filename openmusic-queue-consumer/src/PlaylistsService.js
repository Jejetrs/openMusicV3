const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistById(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name 
             FROM playlists 
             WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    const songsQuery = {
      text: `SELECT songs.id, songs.title, songs.performer
             FROM songs
             INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await this._pool.query(songsQuery);

    return {
      playlist: {
        id: playlistResult.rows[0].id,
        name: playlistResult.rows[0].name,
        songs: songsResult.rows,
      },
    };
  }
}

module.exports = PlaylistsService;