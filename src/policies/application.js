const User = require ("../db/models/").User;

module.exports = class ApplicationPolicy {

  constructor(user, record) {
    this.user = user;
    this.record = record;
  }

  _isOwner() {
    return this.record && (this.record.userId == this.user.id);
  }

  _isAdmin() {
    return this.user && this.user.role == User.ADMIN;
  }

  _isPremium() {
    return this.user && this.user.role == User.PREMIUM;
  }

  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  show() {
    return true;
  }

  edit() {
    return true;
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this._isOwner() || this._isAdmin();
  }
}
