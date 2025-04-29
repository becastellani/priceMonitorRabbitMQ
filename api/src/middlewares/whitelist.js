export const whitelist = (req, res, next) => {
    const whitelist = process.env.WHITELIST.split(",");
    const clientIp = req.ip || req.connection.remoteAddress; 

    if (!whitelist.includes(clientIp)) {
        return res.forbidden();
    }

    next();
}