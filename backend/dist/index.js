"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const modules_1 = __importDefault(require("./routes/modules"));
const users_1 = __importDefault(require("./routes/users"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const auth_1 = __importDefault(require("./routes/auth"));
const candidates_1 = __importDefault(require("./routes/candidates"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Allow all origins - handles preflight OPTIONS automatically
app.use((0, cors_1.default)({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.options('*', (0, cors_1.default)()); // Respond to ALL preflight requests
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/modules', modules_1.default);
app.use('/api/users', users_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/candidates', candidates_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Backend API is running correctly.',
        database: 'mocked',
        timestamp: new Date().toISOString()
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
    console.log(`Test the health endpoint: http://localhost:${PORT}/api/health`);
});
