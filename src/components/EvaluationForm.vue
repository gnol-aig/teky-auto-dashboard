<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import type {
    EvaluatedCriteria,
    Evaluation,
    EvaluationPayload,
    Student,
    StudentEvaluationStatus,
} from '@/types'

const props = defineProps<{
    sessionId: string | number
    students: Student[]
}>()

const api = useApi()

const formId = 11
const formName = 'TEKY - Đánh giá cuối buổi'
const selectedStudentId = ref<string | number>('')
const selectedAnswers = ref<Record<number, string>>({})
const selectedPreset = ref('')
const evaluationStatuses = ref<StudentEvaluationStatus[]>([])
const loading = ref(false)
const evaluationsLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const evaluationTemplate: Array<Evaluation> = [
    {
        "id": 123,
        "name": "Mức độ tập trung trong giờ học",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn rất tập trung, thể hiện qua sự tương tác với toàn bộ nội dung bài học",
            "Bạn thỉnh thoảng bị mất tập trung tại một số thời điểm trong bài học",
            "Bạn ít tập trung trong hầu hết thời gian học"
        ],
        "list_point_answers": [
            {
                "name": "Bạn rất tập trung, thể hiện qua sự tương tác với toàn bộ nội dung bài học",
                "point": 3
            },
            {
                "name": "Bạn thỉnh thoảng bị mất tập trung tại một số thời điểm trong bài học",
                "point": 2
            },
            {
                "name": "Bạn ít tập trung trong hầu hết thời gian học",
                "point": 1
            }
        ],
        "group": {
            "id": 10,
            "name": "Thái độ học tập"
        }
    },
    {
        "id": 178,
        "name": "Ý tưởng dự án/sản phẩm",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Dự án có sự mở rộng về chủ đề/vấn đề của bài học. Dự án hoàn toàn không sử dụng ý tưởng từ dự án khác. Thể hiện được tính cá nhân hóa.",
            "Dự án có chủ đề/vấn đề rõ ràng. Có sử dụng một số ý tưởng từ các dự án khác nhưng được thay đổi cho phù hợp với sản phẩm",
            "Dự án không thể hiện được vấn đề/chủ đề cụ thể cần hướng đến.",
            "Dự án thể hiện được 1 phần chủ đề/vấn đề của bài học. Dự án có sự dụng một số ý tưởng từ sản phẩm khác"
        ],
        "list_point_answers": [
            {
                "name": "Dự án có sự mở rộng về chủ đề/vấn đề của bài học. Dự án hoàn toàn không sử dụng ý tưởng từ dự án khác. Thể hiện được tính cá nhân hóa.",
                "point": 4
            },
            {
                "name": "Dự án có chủ đề/vấn đề rõ ràng. Có sử dụng một số ý tưởng từ các dự án khác nhưng được thay đổi cho phù hợp với sản phẩm",
                "point": 3
            },
            {
                "name": "Dự án không thể hiện được vấn đề/chủ đề cụ thể cần hướng đến.",
                "point": 1
            },
            {
                "name": "Dự án thể hiện được 1 phần chủ đề/vấn đề của bài học. Dự án có sự dụng một số ý tưởng từ sản phẩm khác",
                "point": 2
            }
        ],
        "group": {
            "id": 12,
            "name": "Sản phẩm"
        }
    },
    {
        "id": 130,
        "name": "Tư duy phản biện (Critical Thinking)",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn còn rụt rè trong việc đưa ra quan điểm cá nhân",
            "Bạn chưa đưa ra được dẫn chứng cho quan điểm cá nhân",
            "Bạn tích cực lắng nghe và đặt câu hỏi, trao đổi xây dựng bài học",
            "Bạn chủ động lập luận, tìm hiểu vấn đề và đưa ra phương án giải quyết",
            "Bạn có trao đổi, phát biểu ý kiến nhưng chưa đúng trọng tâm bài học"
        ],
        "list_point_answers": [
            {
                "name": "Bạn còn rụt rè trong việc đưa ra quan điểm cá nhân",
                "point": 1
            },
            {
                "name": "Bạn chưa đưa ra được dẫn chứng cho quan điểm cá nhân",
                "point": 3
            },
            {
                "name": "Bạn tích cực lắng nghe và đặt câu hỏi, trao đổi xây dựng bài học",
                "point": 4
            },
            {
                "name": "Bạn chủ động lập luận, tìm hiểu vấn đề và đưa ra phương án giải quyết",
                "point": 5
            },
            {
                "name": "Bạn có trao đổi, phát biểu ý kiến nhưng chưa đúng trọng tâm bài học",
                "point": 2
            }
        ],
        "group": {
            "id": 9,
            "name": "Kĩ Năng"
        }
    },
    {
        "id": 131,
        "name": "Hợp tác nhóm (Collaboration)",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn nỗ lực hoàn thành nhiệm vụ được giao, hướng tới đạt mục tiêu của nhóm",
            "Bạn tham gia hoạt động nhóm nhưng chưa tích cực",
            "Bạn có thể điều phối các công việc trong nhóm, hướng tới đạt mục tiêu của đội nhóm",
            "Bạn chưa sẵn sàng tham gia hoạt động nhóm"
        ],
        "list_point_answers": [
            {
                "name": "Bạn nỗ lực hoàn thành nhiệm vụ được giao, hướng tới đạt mục tiêu của nhóm",
                "point": 3
            },
            {
                "name": "Bạn tham gia hoạt động nhóm nhưng chưa tích cực",
                "point": 2
            },
            {
                "name": "Bạn có thể điều phối các công việc trong nhóm, hướng tới đạt mục tiêu của đội nhóm",
                "point": 4
            },
            {
                "name": "Bạn chưa sẵn sàng tham gia hoạt động nhóm",
                "point": 1
            }
        ],
        "group": {
            "id": 9,
            "name": "Kĩ Năng"
        }
    },
    {
        "id": 132,
        "name": "Chia sẻ ý tưởng (Communication)",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn trình bày được ý tưởng, nhưng chưa trôi chảy",
            "Bạn chưa thể trình bày rõ ràng ý tưởng của mình. Cần rèn luyện thêm",
            "Trình bày thuyết phục và xử lý tình huống tốt",
            "Bạn trình bày ý tưởng tự tin, trôi chảy và thuyết phục"
        ],
        "list_point_answers": [
            {
                "name": "Bạn trình bày được ý tưởng, nhưng chưa trôi chảy",
                "point": 2
            },
            {
                "name": "Bạn chưa thể trình bày rõ ràng ý tưởng của mình. Cần rèn luyện thêm",
                "point": 1
            },
            {
                "name": "Trình bày thuyết phục và xử lý tình huống tốt",
                "point": 4
            },
            {
                "name": "Bạn trình bày ý tưởng tự tin, trôi chảy và thuyết phục",
                "point": 3
            }
        ],
        "group": {
            "id": 9,
            "name": "Kĩ Năng"
        }
    },
    {
        "id": 124,
        "name": "Mức độ tương tác trong giờ học",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn tích cực tham gia các hoạt động trong lớp, đôi lúc còn đề xuất các hoạt động trò chơi cho cả lớp",
            "Bạn chủ động tham gia các hoạt động trong lớp",
            "Bạn không tham gia vào các hoạt động, chỉ phát biểu khi giáo viên gọi tên",
            "Bạn muốn tham gia các hoạt động nhưng còn tương đối rụt rè so với các bạn"
        ],
        "list_point_answers": [
            {
                "name": "Bạn tích cực tham gia các hoạt động trong lớp, đôi lúc còn đề xuất các hoạt động trò chơi cho cả lớp",
                "point": 4
            },
            {
                "name": "Bạn chủ động tham gia các hoạt động trong lớp",
                "point": 3
            },
            {
                "name": "Bạn không tham gia vào các hoạt động, chỉ phát biểu khi giáo viên gọi tên",
                "point": 1
            },
            {
                "name": "Bạn muốn tham gia các hoạt động nhưng còn tương đối rụt rè so với các bạn",
                "point": 2
            }
        ],
        "group": {
            "id": 10,
            "name": "Thái độ học tập"
        }
    },
    {
        "id": 126,
        "name": "Đi muộn/trễ",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn đi học đúng giờ ",
            "Bạn vào lớp muộn trên 15'",
            "Bạn vào lớp muộn dưới 15'"
        ],
        "list_point_answers": [
            {
                "name": "Bạn đi học đúng giờ ",
                "point": 3
            },
            {
                "name": "Bạn vào lớp muộn trên 15'",
                "point": 1
            },
            {
                "name": "Bạn vào lớp muộn dưới 15'",
                "point": 2
            }
        ],
        "group": {
            "id": 10,
            "name": "Thái độ học tập"
        }
    },
    {
        "id": 127,
        "name": "Bài tập về nhà",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn đã thực hiện bài tập, độ chính xác từ 50% đến 80%",
            "Bạn chưa thực hiện bài tập về nhà",
            "Bạn đã thực hiện đầy đủ các bài tập, độ chính xác từ 80% đến 90%",
            "Bạn đã thực hiện các bài tập nhưng độ chính xác <50%",
            "Buổi học hôm nay không có bài tập về nhà",
            "Bạn đã hoàn thành xuất sắc bài tập về nhà và hầu như không có lỗi nào trong kết quả"
        ],
        "list_point_answers": [
            {
                "name": "Bạn đã thực hiện bài tập, độ chính xác từ 50% đến 80%",
                "point": 3
            },
            {
                "name": "Bạn chưa thực hiện bài tập về nhà",
                "point": 1
            },
            {
                "name": "Bạn đã thực hiện đầy đủ các bài tập, độ chính xác từ 80% đến 90%",
                "point": 4
            },
            {
                "name": "Bạn đã thực hiện các bài tập nhưng độ chính xác <50%",
                "point": 2
            },
            {
                "name": "Buổi học hôm nay không có bài tập về nhà",
                "point": 1
            },
            {
                "name": "Bạn đã hoàn thành xuất sắc bài tập về nhà và hầu như không có lỗi nào trong kết quả",
                "point": 5
            }
        ],
        "group": {
            "id": 8,
            "name": "Kiến thức"
        }
    },
    {
        "id": 128,
        "name": "Kiến thức cũ",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn nhớ rõ kiến thức cũ và biết cách áp dụng và kết hợp kiến thức mới để giải quyết thử thách được đặt ra.",
            "Bạn gần như không nhớ rõ kiến thức cũ, cần giáo viên nhắc lại và hỗ trợ nhiều",
            "Bạn nhớ được hầu hết kiến thức cũ, đôi khi còn quên một số nội dung và cần giáo viên nhắc lại",
            "Bạn nhớ được kiến thức cũ nhưng còn bối rối trong việc áp dụng trong hoàn cảnh mới, kết hợp kiến thức mới."
        ],
        "list_point_answers": [
            {
                "name": "Bạn nhớ rõ kiến thức cũ và biết cách áp dụng và kết hợp kiến thức mới để giải quyết thử thách được đặt ra.",
                "point": 4
            },
            {
                "name": "Bạn gần như không nhớ rõ kiến thức cũ, cần giáo viên nhắc lại và hỗ trợ nhiều",
                "point": 1
            },
            {
                "name": "Bạn nhớ được hầu hết kiến thức cũ, đôi khi còn quên một số nội dung và cần giáo viên nhắc lại",
                "point": 2
            },
            {
                "name": "Bạn nhớ được kiến thức cũ nhưng còn bối rối trong việc áp dụng trong hoàn cảnh mới, kết hợp kiến thức mới.",
                "point": 3
            }
        ],
        "group": {
            "id": 8,
            "name": "Kiến thức"
        }
    },
    {
        "id": 129,
        "name": "Kiến thức mới",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn tiếp thu kiến thức tốt. Hoàn thành 100% các nhiệm vụ bài học",
            "Bạn hoàn thiện dưới 50% các nhiệm vụ kiến thức. Cần cố gắng hơn!",
            "Bạn tiếp thu kiến thức khá tốt, hoàn thành dưới 70% thử thách thuộc phần kiến thức mới trong bài"
        ],
        "list_point_answers": [
            {
                "name": "Bạn tiếp thu kiến thức tốt. Hoàn thành 100% các nhiệm vụ bài học",
                "point": 3
            },
            {
                "name": "Bạn hoàn thiện dưới 50% các nhiệm vụ kiến thức. Cần cố gắng hơn!",
                "point": 1
            },
            {
                "name": "Bạn tiếp thu kiến thức khá tốt, hoàn thành dưới 70% thử thách thuộc phần kiến thức mới trong bài",
                "point": 2
            }
        ],
        "group": {
            "id": 8,
            "name": "Kiến thức"
        }
    },
    {
        "id": 181,
        "name": "Tính hoàn thiện",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Dự án không có bất kỳ thông tin nào.",
            "Dự án có thông tin giới thiệu cơ bản: Tên sản phẩm, người thực hiện,... Dự án có hướng dẫn dành cho người sử dụng ngay trong chính sản phẩm. \"",
            "Dự án có thông tin giới thiệu cơ bản: Tên sản phẩm, người thực hiện,...Dự án có hướng dẫn dành cho người sử dụng thông qua thông tin\"",
            "Dự án có thông tin giới thiệu cơ bản"
        ],
        "list_point_answers": [
            {
                "name": "Dự án không có bất kỳ thông tin nào.",
                "point": 1
            },
            {
                "name": "Dự án có thông tin giới thiệu cơ bản: Tên sản phẩm, người thực hiện,... Dự án có hướng dẫn dành cho người sử dụng ngay trong chính sản phẩm. \"",
                "point": 4
            },
            {
                "name": "Dự án có thông tin giới thiệu cơ bản: Tên sản phẩm, người thực hiện,...Dự án có hướng dẫn dành cho người sử dụng thông qua thông tin\"",
                "point": 3
            },
            {
                "name": "Dự án có thông tin giới thiệu cơ bản",
                "point": 2
            }
        ],
        "group": {
            "id": 12,
            "name": "Sản phẩm"
        }
    },
    {
        "id": 133,
        "name": "Sáng tạo (Creativity)",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn đưa ra được nhiều ý tưởng sáng tạo nhưng cần giáo viên gợi ý lựa chọn và triển khai",
            "Bạn tự tin phát triển ý tưởng cá nhân, dám thử nghiệm, thực hiện các phương án khác nhau để giải quyết vấn đề",
            "Bạn hoàn thiện nhiệm vụ theo mẫu của giáo viên",
            "Bạn có ý tưởng mới nhưng những ý tưởng này ít liên quan đến vấn đề đặt ra."
        ],
        "list_point_answers": [
            {
                "name": "Bạn đưa ra được nhiều ý tưởng sáng tạo nhưng cần giáo viên gợi ý lựa chọn và triển khai",
                "point": 3
            },
            {
                "name": "Bạn tự tin phát triển ý tưởng cá nhân, dám thử nghiệm, thực hiện các phương án khác nhau để giải quyết vấn đề",
                "point": 4
            },
            {
                "name": "Bạn hoàn thiện nhiệm vụ theo mẫu của giáo viên",
                "point": 1
            },
            {
                "name": "Bạn có ý tưởng mới nhưng những ý tưởng này ít liên quan đến vấn đề đặt ra.",
                "point": 2
            }
        ],
        "group": {
            "id": 9,
            "name": "Kĩ Năng"
        }
    },
    {
        "id": 179,
        "name": "Thiết kế",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Dự án dựa trên thiết kế có sẵn",
            "Dự án chưa hoàn thành hoặc chưa thể hiện được ý tưởng ",
            "Dự án được thiết kế theo hướng cá nhân hóa. Các tài nguyên được sử dụng nhất quán, hài hòa.",
            "Dự án có tính nâng cấp dựa trên mẫu có sẵn"
        ],
        "list_point_answers": [
            {
                "name": "Dự án dựa trên thiết kế có sẵn",
                "point": 2
            },
            {
                "name": "Dự án chưa hoàn thành hoặc chưa thể hiện được ý tưởng ",
                "point": 1
            },
            {
                "name": "Dự án được thiết kế theo hướng cá nhân hóa. Các tài nguyên được sử dụng nhất quán, hài hòa.",
                "point": 4
            },
            {
                "name": "Dự án có tính nâng cấp dựa trên mẫu có sẵn",
                "point": 3
            }
        ],
        "group": {
            "id": 12,
            "name": "Sản phẩm"
        }
    },
    {
        "id": 180,
        "name": "Kiến thức",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Dự án chưa hoàn thiện hoặc chưa chạy được. Dự án đạt được 30% kiến thức của bài học",
            "Đã sử dụng tất cả các kiến thức bắt buộc. Các tính năng hoạt động bình thường, vẫn còn một vài câu lệnh thừa nhưng không ảnh hưởng hoạt động của dự án. Dự án có tính thẩm mỹ. Dự án đạt được 50 - 70% kiến thức bài học",
            "Dự án sử dụng các kiến thức nâng cao. Dự án hoạt động bình thường, không có các câu lệnh thừa. Dự án có tính thẩm mỹ tốt, đạt hơn 70% kiến thức bài học. Dự án có sự mở rộng về tính năng hoạt động",
            "Dự án đạt được 30 - 50% kiến thức bài học và có vài lỗi nhỏ. Dự án hoạt động được với các tính năng cơ bản. Dự án chưa có tính thẩm mỹ"
        ],
        "list_point_answers": [
            {
                "name": "Dự án chưa hoàn thiện hoặc chưa chạy được. Dự án đạt được 30% kiến thức của bài học",
                "point": 1
            },
            {
                "name": "Đã sử dụng tất cả các kiến thức bắt buộc. Các tính năng hoạt động bình thường, vẫn còn một vài câu lệnh thừa nhưng không ảnh hưởng hoạt động của dự án. Dự án có tính thẩm mỹ. Dự án đạt được 50 - 70% kiến thức bài học",
                "point": 3
            },
            {
                "name": "Dự án sử dụng các kiến thức nâng cao. Dự án hoạt động bình thường, không có các câu lệnh thừa. Dự án có tính thẩm mỹ tốt, đạt hơn 70% kiến thức bài học. Dự án có sự mở rộng về tính năng hoạt động",
                "point": 4
            },
            {
                "name": "Dự án đạt được 30 - 50% kiến thức bài học và có vài lỗi nhỏ. Dự án hoạt động được với các tính năng cơ bản. Dự án chưa có tính thẩm mỹ",
                "point": 2
            }
        ],
        "group": {
            "id": 12,
            "name": "Sản phẩm"
        }
    },
    {
        "id": 125,
        "name": "Thái độ giao tiếp trong lớp học",
        "type": "SINGLE_CHOICE",
        "sequence": "1",
        "list_answers": [
            "Bạn còn rụt rè trong việc giao tiếp với thầy cô và các bạn trong lớp",
            "Bạn đã tự tin trong giao tiếp và tương tác với thầy cô, bạn bè",
            "Bạn trao đổi, giao tiếp rất chủ động với thầy cô và bạn bè",
            "Bạn thỉnh thoảng còn nói chuyện tự do trong lớp học"
        ],
        "list_point_answers": [
            {
                "name": "Bạn còn rụt rè trong việc giao tiếp với thầy cô và các bạn trong lớp",
                "point": 2
            },
            {
                "name": "Bạn đã tự tin trong giao tiếp và tương tác với thầy cô, bạn bè",
                "point": 3
            },
            {
                "name": "Bạn trao đổi, giao tiếp rất chủ động với thầy cô và bạn bè",
                "point": 4
            },
            {
                "name": "Bạn thỉnh thoảng còn nói chuyện tự do trong lớp học",
                "point": 2
            }
        ],
        "group": {
            "id": 10,
            "name": "Thái độ học tập"
        }
    }
]

const attendedStudents = computed(() => {
    return props.students.filter((student) => student.attendance_status === 'YES')
})

const selectedStudent = computed(() => {
    return props.students.find((student) => String(student.student_id) === String(selectedStudentId.value)) ?? null
})

const selectedStudentEvaluation = computed(() => {
    return (
        evaluationStatuses.value.find(
            (item) => String(item.studentId) === String(selectedStudentId.value),
        ) ?? null
    )
})

const readOnlyEvaluation = computed<EvaluatedCriteria[]>(() => {
    const evaluation = selectedStudentEvaluation.value?.evaluation

    return Array.isArray(evaluation) ? evaluation : []
})

const selectedStudentAlreadyEvaluated = computed(() => {
    return Boolean(selectedStudentEvaluation.value?.status)
})

const selectedStudentCanEvaluate = computed(() => {
    return Boolean(selectedStudent.value) && selectedStudent.value?.attendance_status === 'YES'
})

const evaluatedCriterias = computed(() => {
    return evaluationTemplate.map((criteria) => {
        const answer = selectedAnswers.value[criteria.id] ?? ''
        const answerConfig = criteria.list_point_answers.find((item) => item.name === answer)

        return {
            id: criteria.id,
            name: criteria.name,
            type: criteria.type,
            sequence: criteria.sequence,
            answer,
            point: answerConfig?.point ?? 0,
        }
    })
})

const missingCriteriaCount = computed(() => {
    return evaluatedCriterias.value.filter((criteria) => !criteria.answer).length
})

const canSubmit = computed(() => {
    return (
        Boolean(selectedStudentId.value) &&
        selectedStudentCanEvaluate.value &&
        !selectedStudentAlreadyEvaluated.value &&
        missingCriteriaCount.value === 0 &&
        !loading.value
    )
})

const payload = computed<EvaluationPayload>(() => {
    return {
        id: formId,
        name: formName,
        evaluated_criterias: evaluatedCriterias.value,
    }
})

const evaluate = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!selectedStudentId.value) {
        errorMessage.value = 'Please choose a student before submitting evaluation.'
        return
    }

    if (!selectedStudentCanEvaluate.value) {
        errorMessage.value = 'Only attended students can be evaluated.'
        return
    }

    if (selectedStudentAlreadyEvaluated.value) {
        errorMessage.value = 'This student has already been evaluated.'
        return
    }

    if (missingCriteriaCount.value > 0) {
        errorMessage.value = `Please answer all criteria. Missing: ${missingCriteriaCount.value}.`
        return
    }

    loading.value = true

    try {
        await api.evaluateStudent(props.sessionId, selectedStudentId.value, payload.value)
        evaluationStatuses.value = [
            ...evaluationStatuses.value.filter(
                (item) => String(item.studentId) !== String(selectedStudentId.value),
            ),
            {
                studentId: Number(selectedStudentId.value),
                status: true,
                evaluation: payload.value.evaluated_criterias,
            },
        ]
        successMessage.value = 'Evaluation submitted.'
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Could not submit evaluation.'
    } finally {
        loading.value = false
    }
}

const selectAnswerByPreset = (criteria: Evaluation, preset: string) => {
    const sortedAnswers = [...criteria.list_point_answers].sort((left, right) => left.point - right.point)

    if (sortedAnswers.length === 0) return ''

    if (preset === 'bad') return sortedAnswers[0]?.name ?? ''
    if (preset === 'normal') return sortedAnswers[1]?.name ?? sortedAnswers[0]?.name ?? ''
    if (preset === 'good') {
        return sortedAnswers[sortedAnswers.length - 2]?.name ?? sortedAnswers[sortedAnswers.length - 1]?.name ?? ''
    }
    if (preset === 'excellent') return sortedAnswers[sortedAnswers.length - 1]?.name ?? ''

    return ''
}

const applyPreset = () => {
    if (!selectedPreset.value) return

    selectedAnswers.value = evaluationTemplate.reduce<Record<number, string>>((answers, criteria) => {
        answers[criteria.id] = selectAnswerByPreset(criteria, selectedPreset.value)
        return answers
    }, {})
}

const loadEvaluations = async () => {
    evaluationsLoading.value = true
    errorMessage.value = ''

    try {
        evaluationStatuses.value = await api.getEvaluations(props.sessionId)
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Could not load evaluations.'
    } finally {
        evaluationsLoading.value = false
    }
}

watch(selectedStudentId, () => {
    selectedAnswers.value = {}
    selectedPreset.value = ''
    errorMessage.value = ''
    successMessage.value = ''
})

watch(() => props.sessionId, loadEvaluations)

onMounted(loadEvaluations)

</script>

<template>
    <form class="mx-auto max-w-5xl space-y-5 px-4 pb-8 sm:px-6 lg:px-8" @submit.prevent="evaluate">
        <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Evaluation</p>
                    <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-950">{{ formName }}</h2>
                    <p class="mt-1 text-sm text-slate-500">
                        {{ evaluationTemplate.length }} criteria
                    </p>
                </div>

                <div class="grid gap-3 sm:min-w-80">
                    <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
                        Attended student
                        <select
                            v-model="selectedStudentId"
                            :disabled="evaluationsLoading || attendedStudents.length === 0"
                            class="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                            <option value="">Choose student</option>
                            <option v-for="student in attendedStudents" :key="student.student_id" :value="student.student_id">
                                {{ student.full_name }}
                            </option>
                        </select>
                    </label>

                    <label
                        v-if="selectedStudentId && !selectedStudentAlreadyEvaluated"
                        class="flex flex-col gap-1 text-sm font-medium text-slate-700"
                    >
                        Auto evaluate
                        <select
                            v-model="selectedPreset"
                            class="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            @change="applyPreset"
                        >
                            <option value="">Choose quality</option>
                            <option value="bad">Bad</option>
                            <option value="normal">Normal</option>
                            <option value="good">Good</option>
                            <option value="excellent">Excellent</option>
                        </select>
                    </label>
                </div>
            </div>

            <p v-if="evaluationsLoading" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Loading evaluations...
            </p>

            <p
                v-else-if="attendedStudents.length === 0"
                class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
            >
                No attended students available for evaluation.
            </p>

            <p
                v-else-if="selectedStudentAlreadyEvaluated"
                class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
                This student has already been evaluated. The saved criteria are shown below.
            </p>

            <p v-if="errorMessage" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ errorMessage }}
            </p>

            <p
                v-if="successMessage"
                class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
                {{ successMessage }}
            </p>
        </section>

        <template v-if="selectedStudentId && selectedStudentAlreadyEvaluated">
            <section
                v-for="criteria in readOnlyEvaluation"
                :key="criteria.id"
                class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Criteria {{ criteria.sequence }}
                        </p>
                        <h3 class="mt-1 text-base font-semibold text-slate-950">{{ criteria.name }}</h3>
                        <p class="mt-3 text-sm text-slate-700">{{ criteria.answer }}</p>
                    </div>

                    <span class="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {{ criteria.point }} pts
                    </span>
                </div>
            </section>
        </template>

        <template v-else-if="selectedStudentId">
            <section
                v-for="criteria in evaluationTemplate"
                :key="criteria.id"
                class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div class="mb-4 flex flex-col gap-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Criteria {{ criteria.sequence }}
                    </p>
                    <h3 class="text-base font-semibold text-slate-950">{{ criteria.name }}</h3>
                </div>

                <div class="space-y-3">
                    <label
                        v-for="answer in criteria.list_point_answers"
                        :key="`${criteria.id}-${answer.name}`"
                        class="flex cursor-pointer gap-3 rounded-md border border-slate-200 p-3 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/40"
                        :class="{ 'border-blue-500 bg-blue-50 ring-1 ring-blue-500': selectedAnswers[criteria.id] === answer.name }"
                    >
                        <input
                            v-model="selectedAnswers[criteria.id]"
                            type="radio"
                            :name="`criteria-${criteria.id}`"
                            :value="answer.name"
                            class="mt-1 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="flex-1">{{ answer.name }}</span>
                        <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {{ answer.point }} pts
                        </span>
                    </label>
                </div>
            </section>
        </template>

        <div
            v-if="selectedStudentId && !selectedStudentAlreadyEvaluated"
            class="sticky bottom-0 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur"
        >
            <button
                type="submit"
                :disabled="!canSubmit"
                class="h-10 w-full rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
                {{ loading ? 'Submitting...' : 'Submit evaluation' }}
            </button>
        </div>
    </form>
</template>
