const ApiError = require("../api-error");
const UserService = require("../services/user.service");
const { client } = require("../utils/mongodb.util");
const MongoDB = require("../utils/mongodb.util");

const JWT = require("jsonwebtoken");

exports.signIn = async (req, res, next) => {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findByEmail(req.body?.email);
    if (user.length == 0) {
        return next(new ApiError(400, "Tài khoản không tồn tại!"));
    } else if (user[0].password != req.body?.password) {
        return next(new ApiError(400, "Sai mật khẩu!"));
    } else {
        const token = JWT.sign({ _id: user[0]._id }, "secret");
        // res.cookie('jwt', token, {
        //     httpOnly: true,
        //     maxAge: 24 * 60 * 60 * 1000
        // });
        return res.send({ message: "Đăng nhập thành công", token: token });
    }
}

exports.signUp = async (req, res, next) => {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findByEmail(req.body?.email);

    if (user.length != 0) {
        return next(new ApiError(400, "Tài khoản đã tồn tại!"));
    }

    try {
        const document = await userService.create(req.body);
        if (!document) {
            return res.send({ message: "Tạo tài khoản không thành công" });
        }
        return res.send({ message: "Tạo tài khoản thành công" });
    } catch (error) {
        return next(new ApiError(400, "Đã xảy ra lỗi khi tạo tài khoản"));
    }
}

exports.signOut = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 0 });

    res.send({ message: "Thành công" });
}

exports.authentication = async (req, res) => {
    try {
        const userService = new UserService(MongoDB.client);
        const cookie = req.cookies['jwt'];

        const claims = JWT.verify(cookie, 'secret');

        if (!claims) {
            return res.status(401).send({ message: 'Unauthenticated' });
        }

        const { password, ...user } = await userService.findById(claims._id);

        res.send(user);
    } catch (error) {
        return res.status(401).send({ message: 'Unauthenticated' });
    }
}

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const userService = new UserService(MongoDB.client);
        documents = await userService.find({});
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm tài khoản"))
    }

    return res.send(documents);
}

exports.findOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Tài khoản không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Đã xảy ra lỗi khi tìm người dùng có id = ${req.params.id}`))
    }
};

exports.findSecuredOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findSecuredById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Tài khoản không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Đã xảy ra lỗi khi tìm người dùng có id = ${req.params.id}`))
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được trống!"));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Tài khoản không tồn tại"));
        }
        return res.send({ message: "Cập nhật thông tin người dùng thành công" })
    } catch (error) {
        return next(new ApiError(500, `Đã xảy ra lỗi khi cập nhật người dùng với id = ${req.params.id}`))
    }

};

exports.delete = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Tài khoản không tồn tại"));
        }
        return res.send({ message: "Xóa tài khoản thành công" })
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tài khoản với id = ", req.params.id))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const deletedCount = await userService.deleteAll();
        return res.send({ message: `Xóa ${deletedCount} tài khoản thành công` });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tài khoản"))
    }
};