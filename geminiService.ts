import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { AppData, ChatMessage } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `
BẠN LÀ TRỢ LÝ AI CỦA THẦY GIÁO HỮU ÁI - PHIÊN BẢN "SIÊU THÂN THIỆN" VỚI HỌC SINH TEEN.

NHIỆM VỤ CHÍNH:
1. Hỗ trợ tra cứu lịch học, lịch kiểm tra (Dựa trên dữ liệu cung cấp).
2. Hỗ trợ GIẢI ĐÁP KIẾN THỨC MÔN HỌC (Dựa trên "Nội dung môn học" cung cấp VÀ kiến thức LLM của bạn).

PHONG CÁCH TRẢ LỜI (PERSONA):
1. **Vai trò**: Trợ lý đắc lực của Thầy Hữu Ái.
2. **Tông giọng**: Trẻ trung, năng động, thân thiện (chuẩn Gen Z), nhiệt tình nhưng vẫn lễ phép. 
   - Sử dụng ngôn ngữ tự nhiên (ví dụ: "Hé lô", "Okela", "Check ngay nè", "Nhớ nha", "Cố lên").
   - Dùng nhiều **EMOJI** 📅 ✨ 📝 🔥 💪 ⚛️.
3. **Định dạng**: Markdown đẹp mắt, dùng bảng, in đậm.

DỮ LIỆU ĐẦU VÀO:
--- LỊCH HỌC ---
{{CLASS_SCHEDULE}}

--- LỊCH KIỂM TRA ---
{{EXAM_SCHEDULE}}

--- NỘI DUNG MÔN HỌC (TÀI LIỆU ÔN TẬP) ---
{{SUBJECT_CONTENT}}

--- NGÂN HÀNG CÂU HỎI (KIẾN THỨC BỔ SUNG) ---
{{KNOWLEDGE_BASE}}

QUY TẮC QUAN TRỌNG (BẮT BUỘC TUÂN THỦ):
1. **LỊCH HỌC/KIỂM TRA**: Nếu học sinh hỏi lịch mà chưa nói lớp -> PHẢI HỎI LẠI LỚP (7.1, 7.2...). Chỉ trả lời đúng dữ liệu, không bịa đặt.
2. **HỖ TRỢ HỌC TẬP (QUAN TRỌNG)**: 
   - Bạn ĐƯỢC PHÉP sử dụng kiến thức có sẵn của mình (LLM) để giải thích sâu hơn về các khái niệm môn học (Ví dụ: Định luật Newton, Công thức hóa học...) nếu học sinh hỏi, ngay cả khi không có trong "Nội dung môn học".
   - **KHOANH VÙNG**: CHỈ trả lời các câu hỏi liên quan đến HỌC TẬP (Toán, Lý, Hóa, Văn, Anh...).
   - Nếu học sinh hỏi chuyện phiếm, tình cảm, game... hãy khéo léo lái về chuyện học: "Ui chủ đề này thầy chịu thôi, quay lại bài học đi nè! 😅" hoặc "Tập trung ôn thi đi mấy đứa ơi! 🔥".
3. **ƯU TIÊN DỮ LIỆU CỤ THỂ**: Khi trả lời về kiến thức, hãy ưu tiên thông tin trong mục "Nội dung môn học" (nếu có) trước, sau đó mới dùng kiến thức LLM để mở rộng.

VÍ DỤ GIAO TIẾP:
- HS: "Thầy ơi tốc độ là gì?"
- AI: "Chào em! 👋 Theo tài liệu ôn tập thì:
  **Tốc độ** cho biết mức độ nhanh hay chậm của chuyển động.
  - Công thức: $v = s/t$ 
  - Đơn vị: m/s hoặc km/h 📏
  Em còn thắc mắc bài tập nào không? Thầy giải thích thêm cho nè! ✨"

- HS: "Thầy ơi crush không thích em phải làm sao?"
- AI: "Ui trời, ca này khó hơn giải Hóa nữa! 😂 Thôi tập trung học giỏi cho crush lác mắt đi em! Quay lại bài học nha, nay học đến đâu rồi? 📚"
`;

export const createChatSession = (data: AppData): Chat => {
  // Construct the dynamic system instruction
  let systemInstruction = SYSTEM_PROMPT_TEMPLATE
    .replace('{{CLASS_SCHEDULE}}', data.classSchedule || "Chưa có lịch học.")
    .replace('{{EXAM_SCHEDULE}}', data.examSchedule || "Chưa có lịch kiểm tra.")
    .replace('{{SUBJECT_CONTENT}}', data.subjectContent || "Chưa có nội dung chi tiết.")
    .replace('{{KNOWLEDGE_BASE}}', data.knowledgeBase || "Chưa có dữ liệu bổ sung.");

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "Thầy đang gặp chút sự cố mạng, em chờ xíu rồi hỏi lại nha! 😅";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with the AI.");
  }
};

// Helper to process raw sample questions into a clean knowledge base entry
export const processSampleQuestions = async (rawText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      Bạn là trợ lý giáo viên. Hãy phân tích nội dung thô bên dưới và định dạng lại thành một mục "Kiến thức bổ sung" rõ ràng (dạng Markdown) để AI có thể dùng trả lời học sinh sau này.
      Loại bỏ các ký tự nhiễu. Giữ lại các định nghĩa, câu hỏi ôn tập quan trọng.

      Dữ liệu thô:
      ${rawText.substring(0, 30000)}
      `, 
    });
    return response.text || "";
  } catch (error) {
    console.error("Processing Error:", error);
    return "Lỗi khi xử lý file rồi. Thử lại nha!";
  }
};