const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('Activity gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
             FROM playlist_song_activities
             INNER JOIN users ON users.id = playlist_song_activities.user_id
             INNER JOIN songs ON songs.id = playlist_song_activities.song_id
             WHERE playlist_song_activities.playlist_id = $1
             ORDER BY playlist_song_activities.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      const checkQuery = {
        text: 'SELECT id FROM playlists WHERE id = $1',
        values: [playlistId],
      };

      const checkResult = await this._pool.query(checkQuery);

      if (!checkResult.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }
    }

    return result.rows;
  }
}

module.exports = PlaylistActivitiesService;
