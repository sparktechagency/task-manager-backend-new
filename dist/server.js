"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const socketio_1 = __importDefault(require("./socketio"));
const socket_io_1 = require("socket.io");
const colors_1 = __importDefault(require("colors"));
const config_1 = __importDefault(require("./app/config"));
const DB_1 = require("./app/DB");
let server;
const socketServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(socketServer, {
    cors: {
        origin: '*',
    },
});
// async function main() {
//   try {
//     // console.log('config.database_url', config.database_url);
//     // await mongoose.connect(config.database_url as string);
//     await mongoose.connect(
//       'mongodb+srv://taskmanager:taskmanagerPass@cluster0.jz4eg.mongodb.net/taskmanagerApp?retryWrites=true&w=majority&appName=Cluster0'
//     );
//     server = app.listen(Number(config.port), () => {
//       console.log(
//         colors.green(`App is listening on ${config.ip}:${config.port}`).bold,
//       );
//     });
//     socketServer.listen(config.socket_port || 6000, () => {
//       console.log(
//         colors.yellow(
//           `Socket is listening on ${config.ip}:${config.socket_port}`,
//         ).bold,
//       );
//     });
//     socketIO(io);
//     global.io = io;
//   } catch (err) {
//     console.error('Error starting the server:', err);
//     process.exit(1);
//   }
// }
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            // await mongoose.connect(config.database_url as string);
            // await mongoose.connect(
            //   `mongodb://${config.database_user_name}:${config.databse_user_password}@mongo:${config.database_port}/${config.database_name}?authSource=admin`,
            // );
            yield mongoose_1.default.connect(`mongodb://localhost:27017/taskflyapp`);
            // Create a single HTTP server from the Express app
            server = (0, http_1.createServer)(app_1.default);
            // Attach Socket.IO to the same HTTP server
            const io = new socket_io_1.Server(server, {
                cors: {
                    origin: '*',
                },
            });
            // Start listening on the same port for both HTTP and WebSocket
            server.listen(Number(config_1.default.port), () => {
                console.log(colors_1.default.green(`Server (HTTP + Socket.IO) is running on ${config_1.default.ip}:${config_1.default.port}`).bold);
            });
            yield (0, DB_1.createSuperAdmin)();
            // Initialize your Socket.IO handlerssu
            (0, socketio_1.default)(io);
            // Optionally make the socket server globally accessible
            global.io = io;
        }
        catch (err) {
            console.error('Error starting the server:', err);
            process.exit(1);
        }
    });
}
main();
// Graceful shutdown for unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection detected: ${err}`);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// Graceful shutdown for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught exception detected: ${err}`);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
});
