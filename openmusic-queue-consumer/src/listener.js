class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      console.log(`📥 Processing export for playlist: ${playlistId}`);
      console.log(`📧 Target email: ${targetEmail}`);

      const playlist = await this._playlistsService.getPlaylistById(playlistId);
      const result = await this._mailSender.sendEmail(
        targetEmail,
        JSON.stringify(playlist, null, 2),
      );

      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } catch (error) {
      console.error('❌ Error processing message:', error.message);
      console.error(error);
    }
  }
}

module.exports = Listener;