//admin handlers
exports.home = (req, res) => {
    res.render('admin/home');
}

exports.users = (req, res) => {
    res.render('admin/users');
}
