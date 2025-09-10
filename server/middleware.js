
module.exports.checkHeaders = (req, res, next)=>{
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.sendStatus(401);
    req.token = auth.slice(7);
    next();
}