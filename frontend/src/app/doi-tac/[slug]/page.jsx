import { Plane, Building2, Truck, Globe, ChevronRight, PhoneCall, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const partnersData = {
    "hang-hang-khong": {
        title: "Hãng hàng không",
        icon: Plane,
        color: "text-sky-500",
        bgColor: "bg-sky-50",
        sections: [
            {
                heading: "Vietnam Airlines",
                content: "Hãng hàng không quốc gia Việt Nam, cung cấp dịch vụ bay chất lượng cao trên hàng trăm tuyến bay nội địa và quốc tế. VietTour hợp tác bảo đảm giá vé cạnh tranh và các chương trình combo tour + vé máy bay tiết kiệm."
            },
            {
                heading: "VietJet Air",
                content: "Hãng hàng không tư nhân hàng đầu Việt Nam với mạng bay rộng khắp khu vực Châu Á. VietTour kết hợp cùng VietJet cung cấp vé máy bay giá rẻ, chương trình khuyến mãi đặc biệt cho khách đặt tour."
            },
            {
                heading: "Bamboo Airways",
                content: "Hãng hàng không định hướng dịch vụ 5 sao, khai thác nhiều đường bay thẳng đến các điểm du lịch nổi tiếng. VietTour hợp tác mang đến trải nghiệm bay cao cấp với mức giá hợp lý."
            },
            {
                heading: "Vietravel Airlines",
                content: "Hãng hàng không du lịch đầu tiên tại Việt Nam, chuyên phục vụ các tuyến bay du lịch. VietTour liên kết với Vietravel Airlines để đem lại trải nghiệm di chuyển thuận tiện nhất cho du khách."
            }
        ]
    },
    "khach-san": {
        title: "Khách sạn đối tác",
        icon: Building2,
        color: "text-emerald-500",
        bgColor: "bg-emerald-50",
        sections: [
            {
                heading: "Vinpearl Resort & Spa",
                content: "Chuỗi khách sạn và resort cao cấp thuộc Tập đoàn Vingroup, trải dài trên khắp các điểm đến du lịch hàng đầu Việt Nam như Phú Quốc, Nha Trang, Đà Nẵng, Hạ Long. VietTour cam kết mức giá ưu đãi đặc biệt khi đặt phòng qua tour."
            },
            {
                heading: "Mường Thanh Hotels",
                content: "Tập đoàn khách sạn lớn nhất Đông Dương với hệ thống hơn 60 khách sạn trải khắp 3 nước Việt Nam, Lào, Campuchia. Đa dạng phân khúc từ Luxury, Grand đến Holiday, phù hợp mọi nhu cầu lưu trú."
            },
            {
                heading: "Saigontourist Hotels",
                content: "Chuỗi khách sạn uy tín thuộc Tổng Công ty Du lịch Sài Gòn, sở hữu nhiều khách sạn đẳng cấp tại TP.HCM, Đà Lạt, Vũng Tàu. VietTour hợp tác để cung cấp dịch vụ lưu trú chất lượng với giá tốt nhất."
            },
            {
                heading: "FLC Hotels & Resorts",
                content: "Hệ thống resort nghỉ dưỡng phức hợp hiện đại tại Quy Nhơn, Sầm Sơn, Hạ Long. VietTour liên kết đem đến các gói nghỉ dưỡng đẳng cấp, kết hợp sân golf, spa và nhiều tiện ích cao cấp."
            }
        ]
    },
    "van-chuyen": {
        title: "Công ty vận chuyển",
        icon: Truck,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        sections: [
            {
                heading: "Phương Trang (FUTA Bus)",
                content: "Hãng xe khách lớn nhất Việt Nam với mạng lưới tuyến đường phủ khắp cả nước. VietTour hợp tác cung cấp dịch vụ đưa đón và vận chuyển khách du lịch chuyên nghiệp, an toàn và đúng giờ."
            },
            {
                heading: "Hoàng Long",
                content: "Đơn vị vận chuyển du lịch uy tín với đội xe hiện đại, tiện nghi. VietTour liên kết đảm bảo hành trình di chuyển thoải mái, an toàn cho du khách trên mọi cung đường."
            },
            {
                heading: "Sinh Tourist (The Sinh Tourist)",
                content: "Thương hiệu vận chuyển du lịch nổi tiếng, đặc biệt với du khách quốc tế. VietTour hợp tác để mang đến dịch vụ xe buýt du lịch, xe giường nằm chất lượng cao trên các tuyến đường du lịch phổ biến."
            },
            {
                heading: "Mai Linh Express",
                content: "Dịch vụ xe khách chất lượng cao thuộc Tập đoàn Mai Linh. VietTour liên kết sử dụng dịch vụ đưa đón, shuttle bus và xe du lịch riêng cho các đoàn tour, đảm bảo sự tiện lợi và đúng lịch trình."
            }
        ]
    },
    "du-lich-lien-ket": {
        title: "Công ty du lịch liên kết",
        icon: Globe,
        color: "text-violet-500",
        bgColor: "bg-violet-50",
        sections: [
            {
                heading: "Saigontourist",
                content: "Tổng Công ty Du lịch Sài Gòn – đơn vị lữ hành hàng đầu Việt Nam với hơn 40 năm kinh nghiệm. VietTour hợp tác để mở rộng danh mục tour đa dạng, đặc biệt các tour cao cấp và tour quốc tế."
            },
            {
                heading: "Vietravel",
                content: "Công ty lữ hành lớn nhất Việt Nam, tiên phong trong các sản phẩm du lịch sáng tạo. VietTour liên kết để cung cấp thêm nhiều lựa chọn tour chất lượng cao cho du khách."
            },
            {
                heading: "Fiditour",
                content: "Công ty du lịch uy tín với các chương trình tour nội địa và quốc tế phong phú. VietTour hợp tác mang đến sự đa dạng trong lựa chọn tour với dịch vụ chuyên nghiệp và giá cả hợp lý."
            },
            {
                heading: "BenThanh Tourist",
                content: "Đơn vị du lịch trực thuộc Sở Du lịch TP.HCM, chuyên các tour nội địa chất lượng. VietTour liên kết để phục vụ du khách tốt hơn với hệ thống tour phủ khắp các vùng miền Việt Nam."
            }
        ]
    }
};

const navItems = [
    { id: "hang-hang-khong", name: "Hãng hàng không", icon: Plane },
    { id: "khach-san", name: "Khách sạn đối tác", icon: Building2 },
    { id: "van-chuyen", name: "Công ty vận chuyển", icon: Truck },
    { id: "du-lich-lien-ket", name: "Công ty du lịch liên kết", icon: Globe },
];

export default async function PartnerPage(props) {
    const params = await props.params;
    const { slug } = params;

    const activePartner = partnersData[slug];

    if (!activePartner) {
        notFound();
    }

    const Icon = activePartner.icon;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto max-w-[1200px] px-4">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-8 border-b border-slate-200 pb-4">
                    <Link href="/" className="hover:text-amber-500 transition-colors font-medium">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Đối tác & thương hiệu</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="text-amber-600 font-bold">{activePartner.title}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:sticky lg:top-24">
                            <div className="p-5 bg-[#0a2d4d] text-white">
                                <h2 className="font-bold text-lg uppercase tracking-wider">Đối tác & thương hiệu</h2>
                                <p className="text-sm text-slate-300 mt-1 opacity-80">Danh mục đối tác</p>
                            </div>
                            <ul className="flex flex-col py-3">
                                {navItems.map((item) => {
                                    const ItemIcon = item.icon;
                                    const isActive = slug === item.id;
                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={`/doi-tac/${item.id}`}
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
                                <h4 className="font-bold text-slate-800 text-sm uppercase mb-3">Liên hệ hợp tác</h4>
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
                                <div className={`p-5 rounded-3xl ${activePartner.bgColor} flex-shrink-0 shadow-sm border border-slate-50`}>
                                    <Icon className={`w-14 h-14 ${activePartner.color}`} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 tracking-tight">{activePartner.title}</h1>
                                    <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-sm font-medium">
                                        Đối tác chiến lược của VietTour
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {activePartner.sections.map((section, idx) => (
                                    <div key={idx} className="group">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${activePartner.bgColor} ${activePartner.color} text-sm font-black`}>0{idx + 1}</span>
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

                            <div className="mt-14 p-6 md:p-8 bg-amber-50 text-amber-900 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-amber-100 shadow-inner">
                                <div className="p-3 bg-white rounded-full text-amber-500 shadow-sm">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-xl font-bold mb-2">Trở thành đối tác của VietTour?</h4>
                                    <p className="text-amber-800/80 mb-4 text-sm md:text-base leading-relaxed">Nếu bạn là doanh nghiệp du lịch, khách sạn, vận chuyển hoặc hàng không và muốn hợp tác cùng VietTour, hãy liên hệ với chúng tôi ngay!</p>
                                    <Link href="tel:0333303056" className="inline-flex px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md items-center gap-2">
                                        <PhoneCall className="w-4 h-4" />
                                        Liên hệ hợp tác
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
