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
const mentors_1 = __importDefault(require("./routes/mentors"));
const progress_1 = __importDefault(require("./routes/progress"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const reports_1 = __importDefault(require("./routes/reports"));
const team_1 = __importDefault(require("./routes/team"));
const admin_1 = __importDefault(require("./routes/admin"));
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
app.use('/api/mentors', mentors_1.default);
app.use('/api/progress', progress_1.default);
app.use('/api/quiz', quiz_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/team', team_1.default);
app.use('/api/admin', admin_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
    console.log(`Test the health endpoint: http://localhost:${PORT}/api/health`);
});
