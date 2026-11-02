const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');

const imageExtensions = {
  'image/apng': '.apng',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

class AlbumsHandler {
  constructor(service, storageService, validator, uploadsValidator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const cover = request.payload.cover || request.payload;
    const { id } = request.params;

    if (!cover || typeof cover.pipe !== 'function') {
      throw new InvariantError('Cover harus berupa file');
    }

    const headers = cover.hapi?.headers || {
      'content-type': request.headers['content-type']?.split(';')[0].trim(),
    };
    this._uploadsValidator.validateImageHeaders(headers);

    const metadata = cover.hapi || {
      filename: `cover${imageExtensions[headers['content-type']]}`,
      headers,
    };
    const coverUrl = await this._storageService.writeFile(cover, metadata);
    await this._service.addCoverAlbum(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.likeAlbum(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.unlikeAlbum(userId, albumId);

    return {
      status: 'success',
      message: 'Berhasil batal menyukai album',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    await this._service.verifyAlbumExists(albumId);
    const { likes, source } = await this._service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = AlbumsHandler;
