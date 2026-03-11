import { Shield, CreditCard, XCircle, FileText, HelpCircle, ChevronRight, PhoneCall, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Define structured content for policies
const policiesData = {
    "huong-dan": {
        title: "Hướng dẫn đặt tour",
        icon: HelpCircle,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        sections: [
            {
                heading: "Bước 1: Tìm kiếm tour",
                content: "Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục tour trên trang chủ để tìm tour phù hợp với điểm đến, thời gian và ngân sách của bạn."
            },
            {
                heading: "Bước 2: Xem chi tiết và chọn ngày",
                content: "Nhấn vào tour để xem thông tin chi tiết về lịch trình, điểm khởi hành, giá cả và các dịch vụ đi kèm. Chọn ngày khởi hành mong muốn trên lịch."
            },
            {
                heading: "Bước 3: Tùy chọn số lượng",
                content: "Chọn số lượng khách. Hệ thống sẽ tự động tính toán tổng số tiền tạm tính cho chuyến đi của bạn."
            },
            {
                heading: "Bước 4: Nhập thông tin liên hệ và hành khách",
                content: "Điền đầy đủ và chính xác thông tin người đặt tour và thông tin những người đi cùng. Thông tin này sẽ được sử dụng để liên lạc và làm thủ tục bảo hiểm, vé máy bay (nếu có)."
            },
            {
                heading: "Bước 5: Thanh toán",
                content: "Chọn phương thức thanh toán phù hợp (VNPay trực tuyến, hoặc thanh toán theo thỏa thuận). Hoàn tất quá trình thanh toán để xác nhận đặt tour."
            },
            {
                heading: "Bước 6: Nhận xác nhận",
                content: "Sau khi đặt tour thành công, bạn sẽ nhận được thông báo trạng thái hoặc email xác nhận đặt tour cùng với các hướng dẫn chi tiết cho chuyến đi."
            }
        ]
    },
    "thanh-toan": {
        title: "Chính sách thanh toán",
        icon: CreditCard,
        color: "text-green-500",
        bgColor: "bg-green-50",
        sections: [
            {
                heading: "1. Phương thức thanh toán",
                content: "VietTour cung cấp các phương thức thanh toán đa dạng và linh hoạt để mang lại sự thuận tiện nhất cho khách hàng:\n• Thanh toán trực tuyến an toàn qua cổng VNPay (hỗ trợ Thẻ ATM nội địa, thẻ tín dụng Visa, Mastercard, JCB, QR Code).\n• Thanh toán bằng tiền mặt tại văn phòng giao dịch của VietTour (nếu được hỗ trợ đối với tour cụ thể)."
            },
            {
                heading: "2. Quy định thanh toán",
                content: "• Đối với tour thông thường: Yêu cầu thanh toán toàn bộ 100% giá trị tour hoặc đặt cọc theo quy định hệ thống trên mỗi tour để xác nhận giữ chỗ.\n• Khi thanh toán trực tuyến, vui lòng thực hiện trong thời gian quy định trước khi hệ thống tự động hủy đơn do quá hạn."
            },
            {
                heading: "3. Hóa đơn điện tử",
                content: "VietTour cung cấp hóa đơn điện tử hợp lệ cho các giao dịch theo quy định. Quý khách có yêu cầu xuất hóa đơn thay mặt tổ chức vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng tôi."
            }
        ]
    },
    "huy-tour": {
        title: "Chính sách hủy tour",
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-50",
        sections: [
            {
                heading: "1. Quy định chung",
                content: "Khách hàng có quyền báo hủy tour trước ngày khởi hành. Việc thông báo hủy tour phải được thực hiện thông qua chức năng trên website hoặc bằng văn bản (email) / thông báo trực tiếp đến bộ phận hỗ trợ VietTour."
            },
            {
                heading: "2. Điều kiện hủy",
                content: "• Hủy trước 30 ngày so với ngày khởi hành: Hoàn lại 100% chi phí tour.\n• Hủy từ 15 đến 29 ngày trước ngày khởi hành: Chi phí hủy tour là 30% tổng giá trị tour.\n• Hủy từ 7 đến 14 ngày trước ngày khởi hành: Chi phí hủy tour là 50% tổng giá trị tour.\n• Hủy trong vòng 7 ngày trước ngày khởi hành: Chi phí hủy tour là 100% tổng giá trị tour (không hoàn phí)."
            },
            {
                heading: "3. Điều kiện hủy đối với ngày Lễ, Tết",
                content: "Các tour khởi hành trong thời gian cao điểm Lễ, Tết (các ngày nghỉ Lễ Quốc Gia) thường áp dụng chính sách phạt 100% trị giá gốc hoặc theo quy định đặc thù của từng tour không cho phép hủy hoặc dời ngày."
            },
            {
                heading: "4. Trường hợp khách quan (bất khả kháng)",
                content: "Trong trường hợp hủy chuyến đi do sự kiện bất khả kháng như thiên tai, dịch bệnh, hoả hoạn, đình công, hoặc yêu cầu của cơ quan chức năng, VietTour sẽ xem xét dời ngày hoặc hoàn trả chi phí sau khi đã trừ đi các chi phí dịch vụ cơ bản không thể hoàn lại (như vé máy bay không hoàn, đặt cọc khách sạn)."
            }
        ]
    },
    "dieu-khoan": {
        title: "Điều khoản sử dụng",
        icon: FileText,
        color: "text-amber-500",
        bgColor: "bg-amber-50",
        sections: [
            {
                heading: "1. Chấp nhận và sửa đổi điều khoản",
                content: "Bằng việc sử dụng website, Ứng dụng và Dịch vụ của VietTour, quý khách xác nhận đã đọc, hiểu và đồng ý hoàn toàn với các điều khoản này. VietTour có quyền sửa đổi nội dung điều khoản bất kỳ lúc nào và sẽ được cập nhật trên website."
            },
            {
                heading: "2. Trách nhiệm của khách hàng",
                content: "• Cung cấp thông tin hồ sơ và booking (đặt chỗ) trung thực, chính xác.\n• Tuân thủ nghiêm ngặt các quy định về an toàn, luật pháp của điểm đến và nội quy của đoàn du lịch.\n• Đảm bảo sức khỏe cần thiết cho các hoạt động trải nghiệm trong tour mình đăng ký."
            },
            {
                heading: "3. Quyền và trách nhiệm của VietTour",
                content: "• VietTour cam kết thực hiện đúng mọi dịch vụ đã niêm yết theo chương trình tour trừ trường hợp có các thay đổi bắt buộc.\n• Trong các tình huống khách quan, VietTour có quyền sắp xếp, thay đổi lộ trình tham quan, lịch bay nhưng vẫn sẽ đảm bảo đầy đủ các điểm đến đã xác nhận ban đầu cho khách hàng."
            },
            {
                heading: "4. Bản quyền nội dung",
                content: "Tất cả nội dung trên nền tảng (hình ảnh, bài viết, dữ liệu, thiết kế đồ họa) đều thuộc bản quyền sở hữu trí tuệ của VietTour. Nghiêm cấm mọi hành vi sao chép, sử dụng thương mại khi chưa có văn bản chấp thuận."
            }
        ]
    },
    "bao-mat": {
        title: "Chính sách bảo mật",
        icon: Shield,
        color: "text-indigo-500",
        bgColor: "bg-indigo-50",
        sections: [
            {
                heading: "1. Mục đích thu thập thông tin",
                content: "VietTour thu thập thông tin của Quý khách (bao gồm họ tên, email, số điện thoại, ngày sinh và giới tính) nhằm mục đích:\n• Xử lý hồ sơ đặt vé, bảo hiểm du lịch, phòng khách sạn dựa trên yêu cầu của khách hàng.\n• Liên hệ xác nhận, tư vấn và hỗ trợ khách hàng trước, trong và sau chuyến đi.\n• Gửi đến Quý khách các ưu đãi đặc quyền (nếu được sự cho phép)."
            },
            {
                heading: "2. Cam kết bảo mật",
                content: "Chúng tôi coi trọng việc bảo mật dữ liệu khách hàng. Tất cả thông tin chỉ được lưu hành nội bộ hoặc chia sẻ trực tiếp với đối tác nhà cung cấp dịch vụ (hãng bay, bảo hiểm) trong phạm vi cần thiết. Tuyệt đối không bán hay trao đổi thông tin khách hàng cho bên thứ ba vì mục đích tiếp thị thương mại."
            },
            {
                heading: "3. An toàn thanh toán trực tuyến",
                content: "VietTour sử dụng cổng trung gian thanh toán uy tín và giao thức mã hóa đường truyền bảo mật cao (SSL). Các thông tin liên quan đến thẻ thanh toán hay tài khoản ngân hàng của quý khách sẽ không được lưu trữ tại hệ thống của chúng tôi để đảm bảo an toàn tuyệt đối."
            },
            {
                heading: "4. Thay đổi hệ thống và xóa thông tin",
                content: "Người dùng có quyền truy cập trang cá nhân để tự chỉnh sửa thông tin hoặc liên hệ trực tiếp đến Ban Quản Trị Hệ Thống yêu cầu khóa/xóa các hồ sơ không còn cần thiết bất kỳ lúc nào."
            }
        ]
    }
};

const navItems = [
    { id: "huong-dan", name: "Cách đặt tour", icon: HelpCircle },
    { id: "thanh-toan", name: "Chính sách thanh toán", icon: CreditCard },
    { id: "huy-tour", name: "Chính sách hủy tour", icon: XCircle },
    { id: "dieu-khoan", name: "Điều khoản sử dụng", icon: FileText },
    { id: "bao-mat", name: "Chính sách bảo mật", icon: Shield },
];

export default async function PolicyPage(props) {
    const params = await props.params;
    const { slug } = params;

    const activePolicy = policiesData[slug];

    if (!activePolicy) {
        notFound();
    }

    const Icon = activePolicy.icon;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto max-w-[1200px] px-4">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-8 border-b border-slate-200 pb-4">
                    <Link href="/" className="hover:text-amber-500 transition-colors font-medium">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Hỗ trợ khách hàng</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="text-amber-600 font-bold">{activePolicy.title}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:sticky lg:top-24">
                            <div className="p-5 bg-[#0a2d4d] text-white">
                                <h2 className="font-bold text-lg uppercase tracking-wider">Hỗ trợ khách hàng</h2>
                                <p className="text-sm text-slate-300 mt-1 opacity-80">Danh mục chính sách</p>
                            </div>
                            <ul className="flex flex-col py-3">
                                {navItems.map((item) => {
                                    const ItemIcon = item.icon;
                                    const isActive = slug === item.id;
                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={`/chinh-sach/${item.id}`}
                                                className={`group flex items-center gap-3 px-6 py-4 transition-all duration-300 ${isActive
                                                    ? "bg-amber-50/80 text-amber-600 border-r-4 border-amber-500 font-semibold shadow-inner"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-r-4 border-transparent hover:border-slate-300"
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                                    <ItemIcon className="w-4 h-4" />
                                                </div>
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 m-4 rounded-xl">
                                <h4 className="font-bold text-slate-800 text-sm uppercase mb-3">Cần Trợ Giúp?</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <PhoneCall className="w-4 h-4 text-amber-500" />
                                        <span className="font-medium">0333 303 056</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="w-4 h-4 text-amber-500" />
                                        <span>hoangtom976@gmail.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 lg:p-12">
                            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 pb-10 border-b border-slate-100">
                                <div className={`p-5 rounded-3xl ${activePolicy.bgColor} flex-shrink-0 shadow-sm border border-slate-50`}>
                                    <Icon className={`w-14 h-14 ${activePolicy.color}`} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 tracking-tight">{activePolicy.title}</h1>
                                    <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-sm font-medium">
                                        Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {activePolicy.sections.map((section, idx) => (
                                    <div key={idx} className="group">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${activePolicy.bgColor} ${activePolicy.color} text-sm font-black`}>0{idx + 1}</span>
                                            {section.heading}
                                        </h3>
                                        <div className="space-y-3 pl-11">
                                            {section.content.split('\n').map((paragraph, pIdx) => {
                                                const text = paragraph.trim();
                                                if (!text) return null;

                                                const isBullet = text.startsWith('•');
                                                const contentText = isBullet ? text.substring(1).trim() : text;

                                                return (
                                                    <div key={pIdx} className="flex items-start gap-2">
                                                        {isBullet && <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />}
                                                        <p className={`text-slate-600 leading-relaxed text-[1.05rem] ${isBullet ? 'flex-1' : ''}`}>
                                                            {contentText}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-14 p-6 md:p-8 bg-blue-50 text-blue-900 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-blue-100 shadow-inner">
                                <div className="p-3 bg-white rounded-full text-blue-500 shadow-sm">
                                    <HelpCircle className="w-8 h-8" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-xl font-bold mb-2">Bạn cần tư vấn trực tiếp?</h4>
                                    <p className="text-blue-800/80 mb-4 text-sm md:text-base leading-relaxed">Đội ngũ chuyên viên chăm sóc khách hàng của VietTour luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn.</p>
                                    <Link href="tel:0333303056" className="inline-flex px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md items-center gap-2">
                                        <PhoneCall className="w-4 h-4" />
                                        Gọi HOTLINE ngay
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
