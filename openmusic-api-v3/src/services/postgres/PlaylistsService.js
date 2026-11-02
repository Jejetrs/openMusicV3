const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]?.id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT DISTINCT 
              p.id, 
              p.name, 
              u.username
             FROM playlists p
             INNER JOIN users u ON u.id = p.owner
             LEFT JOIN collaborations c ON c.playlist_id = p.id
             WHERE p.owner = $1 OR c.user_id = $1
             ORDER BY p.id`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
    }));
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist({ playlistId, songId, userId }) {
    const songQuery = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const songResult = await this._pool.query(songQuery);

    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    const id = `ps-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]?.id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._addActivity(playlistId, songId, userId, 'add');

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT 
              p.id AS playlist_id,
              p.name AS playlist_name,
              p.owner AS playlist_owner,
              s.id AS song_id,
              s.title AS song_title,
              s.performer AS song_performer
             FROM playlists p
             LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
             LEFT JOIN songs s ON s.id = ps.song_id
             WHERE p.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const usernameQuery = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [result.rows[0].playlist_owner],
    };

    const usernameResult = await this._pool.query(usernameQuery);
    const username = usernameResult.rows[0]?.username ?? null;

    const playlist = {
      id: result.rows[0].playlist_id,
      name: result.rows[0].playlist_name,
      username,
      songs: result.rows
        .filter((row) => row.song_id !== null)
        .map((row) => ({
          id: row.song_id,
          title: row.song_title,
          performer: row.song_performer,
        })),
    };

    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan di playlist');
    }

    await this._addActivity(playlistId, songId, userId, 'delete');
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  // Private method for logging activities
  async _addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    await this._pool.query(query);
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT 
              u.username,
              s.title,
              psa.action,
              psa.time
             FROM playlist_song_activities psa
             INNER JOIN users u ON u.id = psa.user_id
             INNER JOIN songs s ON s.id = psa.song_id
             WHERE psa.playlist_id = $1
             ORDER BY psa.time ASC`,
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

    return {
      playlistId,
      activities: result.rows,
    };
  }
}

module.exports = PlaylistsService;
