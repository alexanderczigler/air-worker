module.exports = {
  month: -1,
  year: -1,
  filterString: function(prefix, suffix) {

    if (this.month === -1) {
      this.month = (new Date()).getMonth() + 1;
    }

    if (this.year === -1) {
      this.year = (new Date()).getFullYear();
    }

    var monthStr = '';
    if (this.month < 10) {
      monthStr = '0' + this.month;
    } else {
      monthStr = this.month;
    }

    return prefix + this.year + monthStr + suffix;
  },
  stepBack: function() {
    if (this.month === 0) {
      this.month = 12;
      this.year -= 1;
    } else {
      this.month -= 1;
    }
  }
}