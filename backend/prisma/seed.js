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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var client_1 = require("@prisma/client");
var slugify_1 = require("slugify");
var bcrypt_1 = require("bcrypt");
var prisma = new client_1.PrismaClient();
var categoriesList = [
    'Gom su', 'Det may', 'May tre dan', 'Do go my nghe', 'Son mai', 'Kim hoan'
];
// Helper to get random item from array
var randItem = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
// Helper to get random number in range
var randInt = function (min, max) { return Math.floor(Math.random() * (max - min + 1) + min); };
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var categories, _i, categoriesList_1, name_1, slug, _a, _b, defaultPassword, hashedPassword, buyerId, artisanId, products, i, cat, price, _c, _d, statuses, cancelReasons, startDate, endDate, i, status_1, orderDate, cancelReason, orderItemsData, numItems, subtotal, j, prod, qty;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('Clearing old mocked data...');
                    // Delete in proper order to respect relations
                    return [4 /*yield*/, prisma.review.deleteMany()];
                case 1:
                    // Delete in proper order to respect relations
                    _e.sent();
                    return [4 /*yield*/, prisma.orderItem.deleteMany()];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, prisma.order.deleteMany()];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, prisma.productImage.deleteMany()];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, prisma.product.deleteMany()];
                case 5:
                    _e.sent();
                    return [4 /*yield*/, prisma.category.deleteMany()];
                case 6:
                    _e.sent();
                    return [4 /*yield*/, prisma.artisanProfile.deleteMany()];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, prisma.profile.deleteMany()];
                case 8:
                    _e.sent();
                    return [4 /*yield*/, prisma.userRole.deleteMany()];
                case 9:
                    _e.sent();
                    return [4 /*yield*/, prisma.refreshToken.deleteMany()];
                case 10:
                    _e.sent();
                    return [4 /*yield*/, prisma.otp.deleteMany()];
                case 11:
                    _e.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 12:
                    _e.sent();
                    console.log('Seeding categories...');
                    categories = [];
                    _i = 0, categoriesList_1 = categoriesList;
                    _e.label = 13;
                case 13:
                    if (!(_i < categoriesList_1.length)) return [3 /*break*/, 16];
                    name_1 = categoriesList_1[_i];
                    slug = (0, slugify_1.default)(name_1, { lower: true, strict: true, trim: true });
                    _b = (_a = categories).push;
                    return [4 /*yield*/, prisma.category.create({ data: { name: name_1, slug: slug } })];
                case 14:
                    _b.apply(_a, [_e.sent()]);
                    _e.label = 15;
                case 15:
                    _i++;
                    return [3 /*break*/, 13];
                case 16:
                    defaultPassword = 'password123';
                    return [4 /*yield*/, (0, bcrypt_1.hash)(defaultPassword, 10)];
                case 17:
                    hashedPassword = _e.sent();
                    console.log('Seeding fake users...');
                    buyerId = 'b0000000-0000-0000-0000-000000000001';
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: buyerId,
                                email: 'buyer@langnghe.com',
                                password: hashedPassword,
                                isEmailVerified: true,
                                roles: { create: { role: 'buyer' } },
                                profile: {
                                    create: {
                                        display_name: 'Khách hàng Demo',
                                        slug: 'khach-hang-demo'
                                    }
                                }
                            }
                        })];
                case 18:
                    _e.sent();
                    artisanId = 'a0000000-0000-0000-0000-000000000001';
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: artisanId,
                                email: 'artisan@langnghe.com',
                                password: hashedPassword,
                                isEmailVerified: true,
                                roles: { create: [{ role: 'buyer' }, { role: 'artisan' }] },
                                profile: {
                                    create: {
                                        display_name: 'Nghệ nhân Demo',
                                        slug: 'nghe-nhan-demo'
                                    }
                                },
                                artisanProfile: {
                                    create: {
                                        fullName: 'Xưởng Gốm Bát Tràng',
                                        slug: 'xuong-gom-bat-trang',
                                        expertise: 'Gốm Sứ Truyền Thống',
                                        location: 'Bát Tràng, Hà Nội'
                                    }
                                }
                            }
                        })];
                case 19:
                    _e.sent();
                    console.log('Seeding products...');
                    products = [];
                    i = 1;
                    _e.label = 20;
                case 20:
                    if (!(i <= 20)) return [3 /*break*/, 23];
                    cat = randItem(categories);
                    price = randInt(1, 20) * 50000;
                    _d = (_c = products).push;
                    return [4 /*yield*/, prisma.product.create({
                            data: {
                                title: "S\u1EA3n ph\u1EA9m ".concat(cat.name, " ").concat(i),
                                slug: (0, slugify_1.default)("S\u1EA3n ph\u1EA9m ".concat(cat.name, " ").concat(i, "-").concat(Date.now()), { lower: true, strict: true }),
                                categoryId: cat.id,
                                artisanId: artisanId,
                                price_retail: price,
                                price_wholesale: price * 0.8,
                                quantity: randInt(10, 100),
                            }
                        })];
                case 21:
                    _d.apply(_c, [_e.sent()]);
                    _e.label = 22;
                case 22:
                    i++;
                    return [3 /*break*/, 20];
                case 23:
                    console.log('Seeding orders...');
                    statuses = ['pending', 'delivering', 'completed', 'cancelled'];
                    cancelReasons = [
                        'Hết hàng',
                        'Khách hủy đơn',
                        'Giao hàng thất bại',
                        'Hư hỏng trong quá trình vận chuyển'
                    ];
                    startDate = new Date('2023-01-01').getTime();
                    endDate = new Date('2025-01-01').getTime();
                    i = 0;
                    _e.label = 24;
                case 24:
                    if (!(i < 150)) return [3 /*break*/, 27];
                    status_1 = i < 120 ? 'completed' : randItem(statuses);
                    orderDate = new Date(startDate + Math.random() * (endDate - startDate));
                    cancelReason = status_1 === 'cancelled' ? randItem(cancelReasons) : null;
                    orderItemsData = [];
                    numItems = randInt(1, 3);
                    subtotal = 0;
                    for (j = 0; j < numItems; j++) {
                        prod = randItem(products);
                        qty = randInt(1, 5);
                        subtotal += prod.price_retail * qty;
                        orderItemsData.push({
                            productId: prod.id,
                            quantity: qty,
                            price: prod.price_retail,
                            createdAt: orderDate,
                            updatedAt: orderDate
                        });
                    }
                    return [4 /*yield*/, prisma.order.create({
                            data: {
                                buyerId: buyerId,
                                artisanId: artisanId,
                                status: status_1,
                                cancelReason: cancelReason,
                                paymentStatus: status_1 === 'completed' ? 'paid' : 'pending',
                                subtotal: subtotal,
                                shippingFee: 30000,
                                platformFee: subtotal * 0.05,
                                artisanAmount: subtotal * 0.95,
                                createdAt: orderDate,
                                updatedAt: orderDate,
                                orderItems: {
                                    create: orderItemsData
                                }
                            }
                        })];
                case 25:
                    _e.sent();
                    _e.label = 26;
                case 26:
                    i++;
                    return [3 /*break*/, 24];
                case 27:
                    console.log('✅ Seeding completely finished!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
