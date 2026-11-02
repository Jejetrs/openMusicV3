exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Foreign key constraints
  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  // Unique constraint
  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', {
    unique: ['playlist_id', 'user_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
