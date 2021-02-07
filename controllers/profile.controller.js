async function getProfile(req, res, next) {
    console.log(req)
    res.status(200).json({message: "Done"})
}

module.exports = {
    getProfile: getProfile
}