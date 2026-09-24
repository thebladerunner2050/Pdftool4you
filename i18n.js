/**
 * i18n.js — English & Hindi (हिन्दी) Language Switcher for PDFTool4You
 * Dedicated to Indian users and global audiences.
 * Manages locale storage, DOM translation, and dynamic language switching.
 */

(function () {
    const STORAGE_KEY = 'pdf_lang';
    const DEFAULT_LANG = 'en';

    const translations = {
        en: {
            // Header & Navigation
            "nav_tools": "Tools",
            "nav_about": "About Us",
            "nav_contact": "Contact",
            "nav_privacy": "Privacy",
            "nav_back": "Back to Tools",
            "badge_in_browser": "100% In-Browser",
            "badge_memory": "100% In-Browser Memory",
            "lang_label": "EN",
            "lang_name_en": "English",
            "lang_name_hi": "हिन्दी (Hindi)",
            "lang_heading": "Language / भाषा",
            "theme_appearance": "Appearance",
            "theme_system": "System default",
            "theme_light": "Light",
            "theme_dark": "Dark",
            "nav_share": "Share",
            "share_title": "Share this Tool",
            "share_desc": "Free, private, 100% on-device PDF & image utilities.",
            "share_copy_link": "Copy Link",
            "share_copied": "Copied!",
            "share_copy_btn": "Copy",
            "share_toast_copied": "Link copied to clipboard!",
            "share_toast_error": "Could not copy link to clipboard.",
            "share_via_apps": "Share via Apps...",
            "share_whatsapp": "WhatsApp",
            "share_twitter": "X (Twitter)",
            "share_linkedin": "LinkedIn",
            "share_email": "Email",

            // Hero section
            "hero_badge_private": "⚡ Private & Fast",
            "hero_badge_zero": "Zero Server Uploads",
            "hero_title": "Minimal, instant utility tools<br class=\"hidden sm:inline\"/> for PDFs and images.",
            "hero_subtitle": "Compress, convert, and format your files safely on your own computer. Your sensitive files never leave your browser memory.",

            // Search and Filters
            "search_placeholder": "Filter tools by keyword (e.g., compress, jpg, png)...",
            "filter_all": "All Tools",
            "filter_pdf": "PDF Tools",
            "filter_image": "Image Tools",
            "counter_showing": "Showing {count} tools",
            "counter_showing_singular": "Showing 1 tool",
            "counter_on_device": "All tools execute 100% on-device",
            "no_results_title": "No tools matched your search",
            "no_results_desc": "Try searching for keywords like \"compress\", \"merge\", \"split\", \"watermark\", \"jpg\", or \"pdf\".",
            "btn_reset_filters": "Reset filters",

            // Section Headers
            "section_pdf_title": "PDF Document Tools",
            "section_pdf_subtitle": "· Local processing",
            "section_image_title": "Image Conversion Utilities",
            "section_image_subtitle": "· High resolution",

            // Tool 1: PDF Compressor
            "tool_compressor_title": "Online PDF Compressor",
            "tool_compressor_desc": "Compress PDF to an exact target size in KB or MB (e.g. ≤ 100 KB, 200 KB, 500 KB, 1 MB) or choose quality presets for online upload portals.",
            "tool_compressor_tag": "Target KB / MB",
            "tool_compressor_tag2": "Fast",

            // Tool 2: Merge PDF
            "tool_merge_title": "Merge PDF Files",
            "tool_merge_desc": "Combine multiple PDF documents into a single file in any order you choose. Fast, drag-and-drop reordering with zero file uploads.",
            "tool_merge_tag": "Reorder pages",
            "tool_merge_tag2": "Uncapped",

            // Tool 3: Split PDF
            "tool_split_title": "Split PDF Document",
            "tool_split_desc": "Extract individual pages, custom page ranges (e.g. 1-3, 5), or separate all pages into individual files. Download singly or as ZIP.",
            "tool_split_tag": "Visual selector",
            "tool_split_tag2": "ZIP export",

            // Tool 4: PDF Watermarker
            "tool_watermark_title": "PDF Watermarker",
            "tool_watermark_desc": "Stamp text or image logos across PDF pages. Full control over opacity, rotation, preset positions, or tiled security patterns with real-time preview.",
            "tool_watermark_tag": "Live canvas preview",
            "tool_watermark_tag2": "Logo support",

            // Tool 5: Image to PDF
            "tool_img2pdf_title": "Image to PDF Converter",
            "tool_img2pdf_desc": "Package your JPG or PNG image directly into a clean, standard PDF document. Perfect for receipts, IDs, certificates, and job applications.",
            "tool_img2pdf_tag": "Multi-format",
            "tool_img2pdf_tag2": "No watermark",

            // Tool 6: PNG to JPG
            "tool_png2jpg_title": "PNG to JPG Converter",
            "tool_png2jpg_desc": "Transform PNG images and transparent graphics into clean, high-quality JPG files. Adjust quality level and download immediately.",
            "tool_png2jpg_tag": "Fast canvas engine",
            "tool_png2jpg_tag2": "No file caps",

            // Tool 7: JPG to PNG
            "tool_jpg2png_title": "JPG to PNG Converter",
            "tool_jpg2png_desc": "Convert standard JPG photos to uncompressed PNG format for crystal-clear clarity, web design assets, and print materials.",
            "tool_jpg2png_tag": "Zero quality loss",
            "tool_jpg2png_tag2": "Instant",

            // Tool 8: WebP to JPG
            "tool_webp2jpg_title": "WebP to JPG Converter",
            "tool_webp2jpg_desc": "Convert modern WebP images to widely compatible JPG format instantly with adjustable quality and background fill.",
            "tool_webp2jpg_tag": "Universal JPG",
            "tool_webp2jpg_tag2": "Fast canvas",

            // General Tool Card Action
            "btn_open_tool": "Open Tool",

            // Privacy Features Section
            "feat_badge": "Browser-Native Execution",
            "feat_main_title": "Engineered for total privacy.",
            "feat_main_subtitle": "Unlike traditional file converters that upload your PDFs and photos to third-party cloud servers, PDFTool4You processes everything locally in browser memory.",
            "feat_1_title": "Zero Remote Storage",
            "feat_1_desc": "Files never transit across the internet. Bank statements, IDs, and tax documents remain strictly on your hardware.",
            "feat_2_title": "Instant Latency",
            "feat_2_desc": "No queuing or waiting for remote server clusters to pick up your job. WebAssembly and HTML5 Canvas run instantly.",
            "feat_3_title": "Always Free & Uncapped",
            "feat_3_desc": "No sign-ups, subscriptions, or intrusive watermarks slapped onto your downloaded documents.",

            // FAQ Section
            "faq_title": "Frequently Asked Questions",
            "faq_subtitle": "Quick answers about how our client-side tools work.",
            "faq_q1": "Are my files uploaded to your servers?",
            "faq_a1": "No. Every single operation is computed completely inside your browser using client-side JavaScript, PDF.js, and HTML Canvas. We do not have any database or storage server holding your files.",
            "faq_q2": "Is there a maximum file size limit?",
            "faq_a2": "There is no artificial limit imposed by us. The only limit is your device's available browser memory. Documents and images of typical sizes (under 100 MB) convert swiftly.",
            "faq_q3": "Does the PDF Compressor add watermarks?",
            "faq_a3": "Never. Your output documents remain 100% clean and watermark-free, fully compliant for government, job, or academic portals.",

            // Footer Brand & Badges
            "footer_brand_desc": "High-performance in-browser PDF & image suite. Compress, merge, split, watermark, and convert without uploading files.",
            "badge_in_browser_memory": "100% In-Browser Memory",
            "footer_tagline": "High-performance in-browser PDF & image suite. Compress, merge, split, watermark, and convert without uploading files.",

            // Footer Column Titles
            "footer_pdf_tools": "PDF Tools",
            "footer_col_pdf": "PDF Tools",
            "footer_image_tools": "Image Tools",
            "footer_col_img": "Image Tools",
            "footer_company_legal": "Company & Legal",
            "footer_col_legal": "Company & Legal",

            // Footer Clean Tool Names
            "footer_tool_compressor": "Compress PDF",
            "footer_tool_merge": "Merge PDF",
            "footer_tool_split": "Split PDF",
            "footer_tool_watermark": "Watermark PDF",
            "footer_tool_remover": "Remove PDF Password",
            "footer_tool_img2pdf": "Image to PDF",
            "footer_tool_webp2jpg": "WebP to JPG",
            "footer_tool_png2jpg": "PNG to JPG",
            "footer_tool_jpg2png": "JPG to PNG",
            "footer_tool_pan": "PAN Card Photo Maker",

            // Footer Legal & Links
            "footer_rights": "© 2026 PDFTool4You. All rights reserved. 100% Client-Side Processing.",
            "footer_copyright": "© 2026 PDFTool4You. All rights reserved. 100% Client-Side Processing.",
            "footer_privacy": "Privacy Policy",
            "footer_terms": "Terms & Conditions",
            "footer_about": "About Us",
            "footer_contact": "Contact Us",
            "footer_disclaimer": "Disclaimer",
            "footer_cookies": "Cookie Policy",

            // Common Tool Workspace UI
            "upload_drop_pdf": "Drop your PDF file here, or click to browse",
            "upload_drop_image": "Drop your image here, or click to browse",
            "btn_select_file": "Select File",
            "label_original_size": "Original Size",
            "label_target_size": "Target Size",
            "label_new_size": "New Size",
            "btn_download": "Download File",
            "btn_process": "Process Now",
            "btn_print_document": "Print Document",
            "btn_printing": "Preparing Print...",
            "tool_pan_meta_title": "PAN Card Photo & Signature Resizer — PDFTool4You",
            "badge_pan_compliance": "NSDL & UTIITSL Compliant",
            "pan_tool_title": "PAN Card Photo & Signature Resizer",
            "pan_tool_subtitle": "Crop, resize, and compress your photograph and signature to match the exact guidelines for NSDL (Protean) or UTIITSL application portals completely on your device.",
            "pan_upload_title": "Upload Photo or Signature Image",
            "pan_upload_desc": "Drag & drop your file here, or click to browse. Supports JPG, PNG, and WebP formats.",
            "pan_guidelines_title": "PORTAL GUIDELINES",
            "pan_guide_1": "<strong>White Background:</strong> Ensure passport photo has a solid plain white background. Avoid colorful, blurred backgrounds.",
            "pan_guide_2": "<strong>Black Ink Signature:</strong> Please sign with <strong>black ballpoint ink</strong> on clear white paper. Blue ink is highly discouraged as scanners might distort it.",
            "pan_guide_3": "<strong>Sharpness:</strong> Face must be straight-facing, with 70% to 80% area coverage. Caps, hats, masks, or dark glasses are strictly rejected.",
            "pan_settings_section": "Application Settings",
            "pan_agency_label": "Application Portal",
            "pan_doc_label": "Document Type",
            "pan_doc_photo_title": "Passport Photo",
            "pan_doc_photo_desc": "For card front",
            "pan_doc_sig_title": "Signature",
            "pan_doc_sig_desc": "For validation",
            "pan_specs_title": "Target Specifications",
            "pan_spec_dims": "Required Dimensions:",
            "pan_spec_dpi": "Resolution (DPI):",
            "pan_spec_pixels": "Calculated Pixels:",
            "pan_spec_size": "Maximum File Size:",
            "pan_compress_settings": "Quality & Compress Settings",
            "pan_quality_label": "JPEG Compression Level",
            "pan_auto_compress_title": "Auto-guarantee size limits",
            "pan_auto_compress_desc": "Automatically lowers image quality if the output file exceeds the portal's strict size limit (e.g. 50 KB).",
            "pan_btn_download_disabled": "Upload image to download",
            "pan_faq_title": "Frequently Asked Questions",
            "pan_faq_subtitle": "Specific queries about PAN card photo and signature submission.",
            "pan_faq_q1": "What is the official size requirement for NSDL photo?",
            "pan_faq_a1": "For NSDL applications, the passport photo must be exactly <strong>3.5 cm x 2.5 cm</strong>, with a scanning resolution of <strong>200 DPI</strong>. The resulting file size should be strictly <strong>under 50 KB</strong> in JPEG format.",
            "pan_faq_q2": "Why does my signature need to be in black ink?",
            "pan_faq_a2": "Online verification systems run high-contrast scanning. <strong>Black ballpoint ink</strong> on clear white paper creates the highest contrast, preventing blurry borders and eliminating rejection risk. Blue ink or pencil marks can fade or drop out during system processing.",
            "pan_faq_q3": "Does UTIITSL use the same requirements as NSDL?",
            "pan_faq_a3": "No. UTIITSL has distinct specifications. Photographs must be precisely <strong>213 x 213 pixels</strong> (at 300 DPI) and <strong>under 30 KB</strong>. Signatures must be <strong>400 x 200 pixels</strong> (at 600 DPI) and <strong>under 60 KB</strong>. This tool automatically shifts presets based on your portal selection.",
            "pan_ctrl_flip_h": "Flip H",
            "pan_ctrl_flip_v": "Flip V",
            "pan_ctrl_reset": "Reset",
            "tool_pan_title": "PAN Card Photo Maker",
            "tool_pan_desc": "Crop and format your photograph and signature to match exact NSDL (Protean) & UTIITSL guidelines under 30 KB / 50 KB limits.",
            "tool_pan_tag": "NSDL & UTIITSL",

            // Tool 8: PDF Password Remover
            "tool_password_remover_meta_title": "PDF Password Remover — Unlock Password Protected PDF Files | PDFTool4You",
            "password_remover_title": "PDF Password Remover",
            "password_remover_subtitle": "Remove passwords, permissions, owner passwords, and security restrictions from your protected PDF files online. Fully client-side with 100% security.",
            "password_remover_upload_title": "Upload Protected PDF Document",
            "password_remover_upload_desc": "Drag & drop your password-protected PDF here, or click to browse. Files are decrypted entirely on your device.",
            "password_remover_enter_pwd": "Enter Password",
            "password_remover_pwd_placeholder": "Enter PDF user or owner password...",
            "password_remover_pwd_hint": "Enter the correct password to unlock this PDF and remove its protection permanently.",
            "password_remover_btn_unlock": "Remove Password & Save",
            "password_remover_btn_unlocking": "Decrypting document...",
            "password_remover_success_title": "PDF Unlocked Successfully!",
            "password_remover_success_desc": "The password and all restrictions have been permanently removed. You can now download the fully decrypted PDF file.",
            "password_remover_err_not_encrypted": "This PDF is not encrypted or password-protected.",
            "password_remover_err_invalid_pwd": "Incorrect password. Please try again.",
            "password_remover_err_failed": "Failed to decrypt. The file might be corrupted.",
            "password_remover_faq_title": "Frequently Asked Questions",
            "password_remover_faq_subtitle": "Find answers to common questions about PDF password removal and security.",
            "password_remover_faq_q1": "How does the browser-side PDF decryption work?",
            "password_remover_faq_a1": "This tool uses the <strong>Web Crypto API</strong> and custom cryptographic handlers completely within your browser. When you provide the password, it decrypts the document's bytes directly in your browser's memory without uploading the file to any server, guaranteeing absolute privacy.",
            "password_remover_faq_q2": "What is the difference between User and Owner passwords?",
            "password_remover_faq_a2": "A <strong>User password</strong> (open password) prevents unauthorized users from opening the file. An <strong>Owner password</strong> (permissions password) restricts actions like printing, editing, or copying text. This tool accepts either password to fully unlock the document and remove both types of protections.",
            "password_remover_faq_q3": "Can I unlock a PDF if I don't know the password?",
            "password_remover_faq_a3": "No. To protect document privacy and comply with standard security policies, you must know the correct User or Owner password to decrypt the file. This tool does not perform brute-force cracking; instead, it provides a safe, on-device way to strip password security once you enter it.",
            "tool_password_remover_card_title": "PDF Password Remover",
            "tool_password_remover_card_desc": "Remove passwords, owner restrictions, and edit/print blocks from secured PDF files. 100% local, safe browser decryption.",
            "tool_password_remover_card_tag": "Decryption"
        },
        hi: {
            // Header & Navigation
            "nav_tools": "उपकरण",
            "nav_about": "हमारे बारे में",
            "nav_contact": "संपर्क करें",
            "nav_privacy": "गोपनीयता",
            "nav_back": "उपकरणों पर वापस जाएँ",
            "badge_in_browser": "100% ब्राउज़र में सुरक्षित",
            "badge_memory": "100% इन-डिवाइस मेमोरी",
            "lang_label": "हिन्दी",
            "lang_name_en": "English",
            "lang_name_hi": "हिन्दी (Hindi)",
            "lang_heading": "Language / भाषा",
            "theme_appearance": "दिखावट (थीम)",
            "theme_system": "सिस्टम डिफ़ॉल्ट",
            "theme_light": "लाइट मोड",
            "theme_dark": "डार्क मोड",
            "nav_share": "शेयर करें",
            "share_title": "इस टूल को शेयर करें",
            "share_desc": "मुफ़्त, 100% ऑन-डिवाइस सुरक्षित पीडीएफ व इमेज टूल्स।",
            "share_copy_link": "लिंक कॉपी करें",
            "share_copied": "कॉपी हुआ!",
            "share_copy_btn": "कॉपी करें",
            "share_toast_copied": "लिंक क्लिपबोर्ड पर कॉपी हो गया!",
            "share_toast_error": "लिंक कॉपी नहीं किया जा सका।",
            "share_via_apps": "अन्य ऐप्स द्वारा शेयर करें...",
            "share_whatsapp": "व्हाट्सएप (WhatsApp)",
            "share_twitter": "एक्स (Twitter)",
            "share_linkedin": "लिंक्डइन (LinkedIn)",
            "share_email": "ईमेल (Email)",

            // Hero section
            "hero_badge_private": "⚡ निजी और अति-तेज़",
            "hero_badge_zero": "शून्य सर्वर अपलोड",
            "hero_title": "पीडीएफ और तस्वीरों के लिए<br class=\"hidden sm:inline\"/> तेज़, सुरक्षित व सरल उपकरण।",
            "hero_subtitle": "सरकारी फॉर्म, नौकरी व निजी दस्तावेज़ों को अपने कंप्यूटर पर ही सुरक्षित रूप से कंप्रेस और कन्वर्ट करें। आपकी गोपनीय फ़ाइलें कभी सर्वर पर नहीं जातीं।",

            // Search and Filters
            "search_placeholder": "उपकरण खोजें (उदा. कंप्रेस, jpg, png, वॉटरमार्क)...",
            "filter_all": "सभी उपकरण",
            "filter_pdf": "पीडीएफ टूल्स",
            "filter_image": "तस्वीर टूल्स",
            "counter_showing": "{count} उपकरण प्रदर्शित",
            "counter_showing_singular": "1 उपकरण प्रदर्शित",
            "counter_on_device": "सभी उपकरण 100% आपके डिवाइस पर चलते हैं",
            "no_results_title": "आपकी खोज से कोई उपकरण नहीं मिला",
            "no_results_desc": "\"compress\", \"merge\", \"split\", \"watermark\", \"jpg\", या \"pdf\" जैसे शब्द खोज कर देखें।",
            "btn_reset_filters": "फ़िल्टर रीसेट करें",

            // Section Headers
            "section_pdf_title": "पीडीएफ दस्तावेज़ उपकरण",
            "section_pdf_subtitle": "· स्थानीय प्रोसेसिंग",
            "section_image_title": "तस्वीर रूपांतरण उपकरण (Image Tools)",
            "section_image_subtitle": "· उच्च गुणवत्ता",

            // Tool 1: PDF Compressor
            "tool_compressor_title": "ऑनलाइन पीडीएफ कंप्रेसर (PDF Compressor)",
            "tool_compressor_desc": "सरकारी फॉर्म और जॉब पोर्टल के लिए पीडीएफ को मनचाहे आकार (उदा. ≤ 100 KB, 200 KB, 500 KB, 1 MB) में तुरंत कंप्रेस करें।",
            "tool_compressor_tag": "मनचाहा KB / MB",
            "tool_compressor_tag2": "अति-तेज़",

            // Tool 2: Merge PDF
            "tool_merge_title": "पीडीएफ फ़ाइलें जोड़ें (Merge PDF)",
            "tool_merge_desc": "कई पीडीएफ दस्तावेज़ों को आसानी से एक फ़ाइल में जोड़ें। ड्रैग-एंड-ड्रॉप सुविधा के साथ तेज़, सुरक्षित और बिना फ़ाइल अपलोड किए।",
            "tool_merge_tag": "पेज क्रम बदलें",
            "tool_merge_tag2": "असीमित",

            // Tool 3: Split PDF
            "tool_split_title": "पीडीएफ अलग करें (Split PDF)",
            "tool_split_desc": "विशिष्ट पृष्ठों को अलग करें (उदा. 1-3, 5) या सभी पृष्ठों को अलग-अलग फ़ाइल में निकालें। एक-एक करके या ZIP में डाउनलोड करें।",
            "tool_split_tag": "पेज चयनकर्ता",
            "tool_split_tag2": "ZIP डाउनलोड",

            // Tool 4: PDF Watermarker
            "tool_watermark_title": "पीडीएफ वॉटरमार्कर (PDF Watermarker)",
            "tool_watermark_desc": "पीडीएफ पर अपना नाम, मुहर या लोगो का वॉटरमार्क लगाएँ। पारदर्शिता, घुमाव और लाइव पूर्वावलोकन के साथ पूर्ण सुरक्षा।",
            "tool_watermark_tag": "लाइव पूर्वावलोकन",
            "tool_watermark_tag2": "लोगो सपोर्ट",

            // Tool 5: Image to PDF
            "tool_img2pdf_title": "तस्वीर से पीडीएफ (Image to PDF)",
            "tool_img2pdf_desc": "अपनी JPG या PNG तस्वीरों को मानक पीडीएफ में बदलें। आधार कार्ड, रसीद, प्रमाण पत्र और आवेदन पत्रों के लिए बिल्कुल उपयुक्त।",
            "tool_img2pdf_tag": "सभी फॉर्मेट",
            "tool_img2pdf_tag2": "कोई वॉटरमार्क नहीं",

            // Tool 6: PNG to JPG
            "tool_png2jpg_title": "PNG से JPG कन्वर्टर",
            "tool_png2jpg_desc": "PNG तस्वीरों और पारदर्शी ग्राफिक्स को साफ़, उच्च-गुणवत्ता वाली JPG फ़ाइलों में बदलें। गुणवत्ता समायोजित करें और तुरंत पाएँ।",
            "tool_png2jpg_tag": "फास्ट कैनवास",
            "tool_png2jpg_tag2": "असीमित फ़ाइलें",

            // Tool 7: JPG to PNG
            "tool_jpg2png_title": "JPG से PNG कन्वर्टर",
            "tool_jpg2png_desc": "सामान्य JPG तस्वीरों को बिना गुणवत्ता खोए पारदर्शी और स्पष्ट PNG प्रारूप में बदलें। वेब डिज़ाइन और प्रिंटिंग हेतु श्रेष्ठ।",
            "tool_jpg2png_tag": "शून्य गुणवत्ता हानि",
            "tool_jpg2png_tag2": "तुरंत",

            // Tool 8: WebP to JPG
            "tool_webp2jpg_title": "WebP से JPG कन्वर्टर",
            "tool_webp2jpg_desc": "आधुनिक WebP तस्वीरों को सार्वभौमिक JPG प्रारूप में तुरंत बदलें। पारदर्शी बैकग्राउंड और गुणवत्ता नियंत्रण के साथ।",
            "tool_webp2jpg_tag": "सार्वभौमिक JPG",
            "tool_webp2jpg_tag2": "फास्ट कैनवास",

            // General Tool Card Action
            "btn_open_tool": "उपकरण खोलें",

            // Privacy Features Section
            "feat_badge": "ब्राउज़र-आधारित निष्पादन",
            "feat_main_title": "संपूर्ण गोपनीयता के लिए निर्मित।",
            "feat_main_subtitle": "पारंपरिक वेबसाइटों के विपरीत जो आपकी फ़ाइलें विदेशी सर्वर पर अपलोड करती हैं, PDFTool4You सब कुछ आपके डिवाइस की मेमोरी में ही प्रोसेस करता है।",
            "feat_1_title": "शून्य रिमोट स्टोरेज",
            "feat_1_desc": "आपकी फ़ाइलें कभी इंटरनेट पर नहीं भेजी जातीं। बैंक स्टेटमेंट, आधार कार्ड और टैक्स दस्तावेज़ केवल आपके कंप्यूटर पर सुरक्षित रहते हैं।",
            "feat_2_title": "शून्य प्रतीक्षा समय (Instant)",
            "feat_2_desc": "किसी दूरस्थ सर्वर की कतार में प्रतीक्षा करने की आवश्यकता नहीं। आधुनिक WebAssembly तकनीक से काम पलक झपकते ही पूरा होता है।",
            "feat_3_title": "हमेशा मुफ़्त और असीमित",
            "feat_3_desc": "कोई लॉगिन नहीं, कोई मासिक शुल्क नहीं, और न ही डाउनलोड की गई फ़ाइलों पर कोई अनावश्यक वॉटरमार्क।",

            // FAQ Section
            "faq_title": "अक्सर पूछे जाने वाले प्रश्न (FAQ)",
            "faq_subtitle": "हमारे ब्राउज़र-आधारित टूल्स कैसे काम करते हैं, इस बारे में त्वरित उत्तर।",
            "faq_q1": "क्या मेरी फ़ाइलें आपके सर्वर पर अपलोड होती हैं?",
            "faq_a1": "बिल्कुल नहीं। प्रत्येक प्रक्रिया आपके कंप्यूटर/मोबाइल के ब्राउज़र में ही सुरक्षित रूप से पूरी होती है। हम आपकी कोई भी फ़ाइल सर्वर पर संग्रहित या देख नहीं सकते।",
            "faq_q2": "क्या फ़ाइल आकार की कोई सीमा है?",
            "faq_a2": "हमारी तरफ से कोई कृत्रिम सीमा नहीं लगाई गई है। केवल आपके डिवाइस की उपलब्ध रैम (RAM) ही सीमा तय करती है। 100 MB तक के दस्तावेज़ बहुत तेज़ी से प्रोसेस होते हैं।",
            "faq_q3": "क्या पीडीएफ कंप्रेसर कोई वॉटरमार्क लगाता है?",
            "faq_a3": "कभी नहीं। आपके दस्तावेज़ 100% साफ़ और बिना किसी वॉटरमार्क के डाउनलोड होते हैं, जो सरकारी फॉर्म, UPSC, SSC या किसी भी पोर्टल के लिए पूरी तरह मान्य हैं।",

            // Footer Brand & Badges
            "footer_brand_desc": "उच्च-प्रदर्शन इन-ब्राउज़र पीडीएफ व इमेज टूल सुइट। बिना फ़ाइल अपलोड किए कंप्रेस, मर्ज, स्प्लिट और कन्वर्ट करें।",
            "badge_in_browser_memory": "100% ब्राउज़र मेमोरी में प्रोसेस",
            "footer_tagline": "उच्च-प्रदर्शन इन-ब्राउज़र पीडीएफ व इमेज टूल सुइट। बिना फ़ाइल अपलोड किए कंप्रेस, मर्ज, स्प्लिट और कन्वर्ट करें।",

            // Footer Column Titles
            "footer_pdf_tools": "पीडीएफ टूल्स",
            "footer_col_pdf": "पीडीएफ टूल्स",
            "footer_image_tools": "इमेज टूल्स",
            "footer_col_img": "इमेज टूल्स",
            "footer_company_legal": "कंपनी और नियम",
            "footer_col_legal": "कंपनी और नियम",

            // Footer Clean Tool Names
            "footer_tool_compressor": "कंप्रेस पीडीएफ (Compress PDF)",
            "footer_tool_merge": "मर्ज पीडीएफ (Merge PDF)",
            "footer_tool_split": "स्प्लिट पीडीएफ (Split PDF)",
            "footer_tool_watermark": "वॉटरमार्क पीडीएफ (Watermark PDF)",
            "footer_tool_remover": "पासवर्ड हटाएं (Remove Password)",
            "footer_tool_img2pdf": "इमेज से पीडीएफ (Image to PDF)",
            "footer_tool_webp2jpg": "वेबपी से जेपीजी (WebP to JPG)",
            "footer_tool_png2jpg": "पीएनजी से जेपीजी (PNG to JPG)",
            "footer_tool_jpg2png": "जेपीजी से पीएनजी (JPG to PNG)",
            "footer_tool_pan": "पैन कार्ड फोटो मेकर (PAN Card Photo Maker)",

            // Footer Legal & Links
            "footer_rights": "© 2026 PDFTool4You. सर्वाधिकार सुरक्षित। 100% क्लाइंट-साइड प्रोसेसिंग।",
            "footer_copyright": "© 2026 PDFTool4You. सर्वाधिकार सुरक्षित। 100% क्लाइंट-साइड प्रोसेसिंग।",
            "footer_privacy": "गोपनीयता नीति (Privacy)",
            "footer_terms": "नियम व शर्तें (Terms)",
            "footer_about": "हमारे बारे में (About)",
            "footer_contact": "संपर्क करें (Contact)",
            "footer_disclaimer": "अस्वीकरण (Disclaimer)",
            "footer_cookies": "कुकी नीति (Cookies)",

            // Common Tool Workspace UI
            "upload_drop_pdf": "अपनी पीडीएफ फ़ाइल यहाँ खींचें या ब्राउज़ करने के लिए क्लिक करें",
            "upload_drop_image": "अपनी तस्वीर यहाँ खींचें या ब्राउज़ करने के लिए क्लिक करें",
            "btn_select_file": "फ़ाइल चुनें",
            "label_original_size": "मूल आकार",
            "label_target_size": "लक्ष्य आकार",
            "label_new_size": "नया आकार",
            "btn_download": "फ़ाइल डाउनलोड करें",
            "btn_process": "शुरू करें",
            "btn_print_document": "दस्तावेज़ प्रिंट करें",
            "btn_printing": "प्रिंट तैयार हो रहा है...",
            "tool_pan_meta_title": "पैन कार्ड फोटो और सिग्नेचर रिसाइज़र — PDFTool4You",
            "badge_pan_compliance": "NSDL और UTIITSL अनुपालन",
            "pan_tool_title": "पैन कार्ड फोटो और सिग्नेचर रिसाइज़र",
            "pan_tool_subtitle": "NSDL (Protean) या UTIITSL आवेदन पोर्टलों के लिए अपने फोटो और हस्ताक्षर को क्रॉप, रिसाइज़ और कंप्रेस करें पूरी तरह से अपने डिवाइस पर सुरक्षित रूप से।",
            "pan_upload_title": "तस्वीर या हस्ताक्षर अपलोड करें",
            "pan_upload_desc": "अपनी फ़ाइल यहाँ खींचें या ब्राउज़ करने के लिए क्लिक करें। जेपीजी, पीएनजी और वेबपी समर्थित हैं।",
            "pan_guidelines_title": "पोर्टल दिशानिर्देश",
            "pan_guide_1": "<strong>सफेद पृष्ठभूमि (White Background):</strong> सुनिश्चित करें कि पासपोर्ट फोटो की पृष्ठभूमि पूरी तरह सफेद हो। रंगीन पृष्ठभूमि अस्वीकार्य है।",
            "pan_guide_2": "<strong>काली स्याही से हस्ताक्षर:</strong> कृपया सफेद कागज पर <strong>काली स्याही</strong> से ही हस्ताक्षर करें। नीली स्याही अस्वीकृत हो सकती है।",
            "pan_guide_3": "<strong>स्पष्टता (Sharpness):</strong> चेहरा बिल्कुल सीधा और 70-80% भाग कवर करना चाहिए। टोपी, चश्मा या मास्क वर्जित है।",
            "pan_settings_section": "आवेदन सेटिंग्स",
            "pan_agency_label": "आवेदन पोर्टल चुनें",
            "pan_doc_label": "दस्तावेज़ का प्रकार",
            "pan_doc_photo_title": "पासपोर्ट फोटो",
            "pan_doc_photo_desc": "कार्ड के अग्रभाग के लिए",
            "pan_doc_sig_title": "हस्ताक्षर",
            "pan_doc_sig_desc": "सत्यापन के लिए",
            "pan_specs_title": "लक्ष्य आवश्यकताएँ (Specifications)",
            "pan_spec_dims": "आवश्यक आयाम:",
            "pan_spec_dpi": "रिज़ॉल्यूशन (DPI):",
            "pan_spec_pixels": "कैलकुलेटेड पिक्सल:",
            "pan_spec_size": "अधिकतम फ़ाइल आकार:",
            "pan_compress_settings": "गुणवत्ता व कंप्रेस सेटिंग्स",
            "pan_quality_label": "जेपीजी कंप्रेस स्तर (JPEG Quality)",
            "pan_auto_compress_title": "आकार सीमा की गारंटी",
            "pan_auto_compress_desc": "यदि आउटपुट फ़ाइल पोर्टल की आकार सीमा (जैसे 50 KB) से अधिक होती है, तो यह टूल गुणवत्ता को स्वतः अनुकूलित कर देता है।",
            "pan_btn_download_disabled": "डाउनलोड करने के लिए छवि अपलोड करें",
            "pan_faq_title": "अक्सर पूछे जाने वाले प्रश्न (FAQ)",
            "pan_faq_subtitle": "पैन कार्ड फोटो और हस्ताक्षर सबमिशन के बारे में विशिष्ट प्रश्न।",
            "pan_faq_q1": "NSDL फोटो के लिए आधिकारिक आकार आवश्यकता क्या है?",
            "pan_faq_a1": "NSDL आवेदनों के लिए, पासपोर्ट फोटो का आकार ठीक <strong>3.5 सेमी x 2.5 सेमी</strong> होना चाहिए, और रिज़ॉल्यूशन <strong>200 DPI</strong> होना चाहिए। फ़ाइल का आकार जेपीजी प्रारूप में <strong>50 KB से कम</strong> होना चाहिए।",
            "pan_faq_q2": "हस्ताक्षर केवल काली स्याही में क्यों होना चाहिए?",
            "pan_faq_a2": "ऑनलाइन सत्यापन प्रणालियाँ उच्च-विपरीत (high-contrast) स्कैनिंग चलाती हैं। सफेद कागज पर <strong>काली स्याही</strong> सबसे अच्छा कंट्रास्ट बनाती है, जिससे रिजेक्शन का खतरा समाप्त हो जाता है।",
            "pan_faq_q3": "क्या UTIITSL और NSDL की आवश्यकताएँ समान हैं?",
            "pan_faq_a3": "नहीं। UTIITSL की आवश्यकताएं भिन्न हैं। फोटो का आकार ठीक <strong>213 x 213 पिक्सल</strong> (300 DPI पर) और <strong>30 KB से कम</strong> होना चाहिए। हस्ताक्षर <strong>400 x 200 पिक्सल</strong> (600 DPI पर) और <strong>60 KB से कम</strong> होना चाहिए।",
            "pan_ctrl_flip_h": "दर्पण (H)",
            "pan_ctrl_flip_v": "दर्पण (V)",
            "pan_ctrl_reset": "रीसेट करें",
            "tool_pan_title": "पैन कार्ड फोटो मेकर",
            "tool_pan_desc": "NSDL (Protean) और UTIITSL सरकारी दिशानिर्देशों के अनुसार पासपोर्ट फोटो और हस्ताक्षर क्रॉप और रीसाइज करें (30 KB / 50 KB सीमा में)।",
            "tool_pan_tag": "NSDL व UTIITSL",

            // Tool 8: PDF Password Remover
            "tool_password_remover_meta_title": "पीडीएफ पासवर्ड रिमूवर — सुरक्षित पीडीएफ अनलॉक करें | PDFTool4You",
            "password_remover_title": "पीडीएफ पासवर्ड रिमूवर",
            "password_remover_subtitle": "सुरक्षित पीडीएफ फाइलों से पासवर्ड, प्रिंट प्रतिबंध, और सुरक्षा सीमाओं को आसानी से हटाएं। पूरी तरह से आपके ब्राउज़र में सुरक्षित और गोपनीय।",
            "password_remover_upload_title": "सुरक्षित पीडीएफ दस्तावेज़ अपलोड करें",
            "password_remover_upload_desc": "पासवर्ड-सुरक्षित पीडीएफ फाइल को यहाँ खींचें या ब्राउज़ करें। फाइलें आपके ही डिवाइस पर प्रोसेस होती हैं।",
            "password_remover_enter_pwd": "पासवर्ड दर्ज करें",
            "password_remover_pwd_placeholder": "पीडीएफ पासवर्ड यहाँ लिखें...",
            "password_remover_pwd_hint": "पीडीएफ सुरक्षा हटाने के लिए सही यूजर या ओनर पासवर्ड दर्ज करें।",
            "password_remover_btn_unlock": "सुरक्षा हटाएं और सहेजें",
            "password_remover_btn_unlocking": "सुरक्षा हटा रहे हैं...",
            "password_remover_success_title": "पीडीएफ सफलतापूर्वक अनलॉक हो गया!",
            "password_remover_success_desc": "पासवर्ड और सभी प्रकार के प्रतिबंधों को स्थायी रूप से हटा दिया गया है। अब आप अनलॉक की गई पीडीएफ फाइल डाउनलोड कर सकते हैं।",
            "password_remover_err_not_encrypted": "यह पीडीएफ सुरक्षित या पासवर्ड-संरक्षित नहीं है।",
            "password_remover_err_invalid_pwd": "गलत पासवर्ड। कृपया पुनः प्रयास करें।",
            "password_remover_err_failed": "सुरक्षा हटाने में विफल। फाइल दूषित हो सकती है।",
            "password_remover_faq_title": "अक्सर पूछे जाने वाले प्रश्न (FAQ)",
            "password_remover_faq_subtitle": "पीडीएफ पासवर्ड हटाने और सुरक्षा के बारे में सामान्य प्रश्नों के त्वरित उत्तर।",
            "password_remover_faq_q1": "ब्राउज़र-आधारित पीडीएफ डिक्रिप्शन कैसे काम करता है?",
            "password_remover_faq_a1": "यह उपकरण आपके ही ब्राउज़र के भीतर सुरक्षित <strong>Web Crypto API</strong> का उपयोग करता है। जब आप पासवर्ड डालते हैं, तो यह सीधे डिवाइस की रैम (RAM) में ही पीडीएफ डिक्रिप्ट कर देता है। आपकी फ़ाइल कभी इंटरनेट पर नहीं भेजी जाती।",
            "password_remover_faq_q2": "यूज़र (User) और ओनर (Owner) पासवर्ड में क्या अंतर है?",
            "password_remover_faq_a2": "<strong>यूज़र पासवर्ड</strong> पीडीएफ खोलने से रोकता है। <strong>ओनर पासवर्ड</strong> संपादन, प्रिंटिंग, या टेक्स्ट कॉपी करने पर रोक लगाता है। यह टूल दस्तावेज़ को पूरी तरह अनलॉक करने के लिए दोनों में से कोई भी पासवर्ड स्वीकार कर लेता है।",
            "password_remover_faq_q3": "क्या मैं पासवर्ड जाने बिना पीडीएफ अनलॉक कर सकता हूँ?",
            "password_remover_faq_a3": "नहीं। दस्तावेज़ों की गोपनीयता और सुरक्षा नियमों के तहत, आपको पासवर्ड पता होना आवश्यक है। यह टूल हैकिंग या क्रैकिंग नहीं करता है, बल्कि आपको अपनी फाइलों से प्रतिबंध हटाने का एक पूर्ण सुरक्षित और तेज़ विकल्प देता है।",
            "tool_password_remover_card_title": "पीडीएफ पासवर्ड रिमूवर",
            "tool_password_remover_card_desc": "सुरक्षित पीडीएफ फाइलों से पासवर्ड, ओनर सुरक्षा और एडिट/प्रिंट ब्लॉक हटाएं। 100% सुरक्षित स्थानीय ब्राउज़र डिक्रिप्शन।",
            "tool_password_remover_card_tag": "डिक्रिप्शन"
        }
    };

    function getLang() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'hi' || stored === 'en') return stored;
        return DEFAULT_LANG;
    }

    function setLang(lang) {
        if (lang !== 'hi' && lang !== 'en') lang = DEFAULT_LANG;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        applyTranslations(lang);
        updateLangUI(lang);
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: lang } }));
    }

    function t(key, lang) {
        const current = lang || getLang();
        const dict = translations[current];
        if (dict && dict[key] !== undefined) return dict[key];
        const defaultDict = translations[DEFAULT_LANG];
        if (defaultDict && defaultDict[key] !== undefined) return defaultDict[key];
        return null;
    }

    function applyTranslations(lang) {
        // 1. Text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = t(key, lang);
            if (val !== null && val !== undefined) {
                el.textContent = val;
            }
        });

        // 2. HTML elements (with <br/> or tags)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            const val = t(key, lang);
            if (val !== null && val !== undefined) {
                el.innerHTML = val;
            }
        });

        // 3. Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = t(key, lang);
            if (val !== null && val !== undefined) {
                el.setAttribute('placeholder', val);
            }
        });

        // 4. Titles / Tooltips
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const val = t(key, lang);
            if (val !== null && val !== undefined) {
                el.setAttribute('title', val);
            }
        });

        // 5. Aria Labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const val = t(key, lang);
            if (val !== null && val !== undefined) {
                el.setAttribute('aria-label', val);
            }
        });

        // 6. Update search counter dynamic text if present on index.html
        const searchCounter = document.getElementById('search-counter');
        if (searchCounter && window.updateToolSearchCounter) {
            window.updateToolSearchCounter();
        }
    }

    function updateLangUI(lang) {
        // Update label on trigger buttons
        document.querySelectorAll('[data-lang-trigger] .lang-current-label').forEach(label => {
            label.textContent = lang === 'hi' ? 'हिन्दी' : 'EN';
        });

        // Update dropdown active checkmarks & highlights
        document.querySelectorAll('[data-lang-value]').forEach(item => {
            const itemLang = item.getAttribute('data-lang-value');
            const isSelected = itemLang === lang;
            item.setAttribute('aria-selected', isSelected ? 'true' : 'false');

            const check = item.querySelector('.lang-check');
            if (check) {
                check.classList.toggle('opacity-100', isSelected);
                check.classList.toggle('opacity-0', !isSelected);
            }

            if (isSelected) {
                item.classList.add('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-900', 'dark:text-white', 'font-semibold');
                item.classList.remove('text-zinc-600', 'dark:text-zinc-400');
            } else {
                item.classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-900', 'dark:text-white', 'font-semibold');
                item.classList.add('text-zinc-600', 'dark:text-zinc-400');
            }
        });
    }

    function initLangDOM() {
        const currentLang = getLang();
        document.documentElement.lang = currentLang;
        applyTranslations(currentLang);
        updateLangUI(currentLang);

        // Bind dropdown menus
        document.querySelectorAll('[data-lang-menu-container]').forEach(container => {
            const trigger = container.querySelector('[data-lang-trigger]');
            const menu = container.querySelector('[data-lang-menu]');

            if (trigger && menu) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = !menu.classList.contains('hidden');
                    
                    // Close theme menu if open
                    document.querySelectorAll('[data-theme-menu]').forEach(m => m.classList.add('hidden'));
                    // Close other lang menus
                    document.querySelectorAll('[data-lang-menu]').forEach(m => m.classList.add('hidden'));
                    
                    if (!isOpen) {
                        menu.classList.remove('hidden');
                    }
                });

                menu.querySelectorAll('[data-lang-value]').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const selectedVal = item.getAttribute('data-lang-value');
                        setLang(selectedVal);
                        menu.classList.add('hidden');
                    });
                });
            }
        });

        // Close dropdowns on outside click or Escape
        document.addEventListener('click', () => {
            document.querySelectorAll('[data-lang-menu]').forEach(m => m.classList.add('hidden'));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('[data-lang-menu]').forEach(m => m.classList.add('hidden'));
            }
        });
    }

    // Expose Global Manager
    window.I18nManager = {
        getLang: getLang,
        setLang: setLang,
        toggle: function () {
            setLang(getLang() === 'en' ? 'hi' : 'en');
        },
        t: t,
        apply: function () {
            applyTranslations(getLang());
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLangDOM);
    } else {
        initLangDOM();
    }
})();
