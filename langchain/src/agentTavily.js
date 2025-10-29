import { ChatDeepSeek } from "@langchain/deepseek"
import { TavilySearch } from '@langchain/tavily'

import { createAgent } from 'langchain';
import 'dotenv/config'

import * as z from 'zod'


const llm = new ChatDeepSeek({
    model: 'deepseek-chat'
})

const tvTool = new TavilySearch({
    maxResults: 2,
    name: 'get_name',
    description: '追剧指南',
    schema: z.object({
        name: z.string().describe('最近比较好看的电视剧的名称')
    })
})

const agent = createAgent({
    model: llm,
    tools: [tvTool]
})

const res = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: '最近有什么好看的电视吗？'
        }
    ]
})

console.log('res', res);


/**
 * 
 * 输出的内容如下
 * res {
  messages: [
    HumanMessage {
      "id": "a27a48b5-7272-4c07-ad58-b3758f7f02db",
      "content": "最近有什么好看的电视吗？",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    AIMessage {
      "id": "a8571114-55fd-4469-bf8d-58d773ae5899",
      "content": "我来帮您搜索一下最近有什么好看的电视剧。",
      "name": "model",
      "additional_kwargs": {
        "tool_calls": [
          {
            "index": 0,
            "id": "call_00_OfVAbpbkxzUK9ZtDVwQpSS3y",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 938,
          "completionTokens": 36,
          "totalTokens": 974
        },
        "finish_reason": "tool_calls",
        "model_provider": "openai",
        "model_name": "deepseek-chat",
        "usage": {
          "prompt_tokens": 938,
          "completion_tokens": 36,
          "total_tokens": 974,
          "prompt_tokens_details": {
            "cached_tokens": 0
          },
          "prompt_cache_hit_tokens": 0,
          "prompt_cache_miss_tokens": 938
        },
        "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
      },
      "tool_calls": [
        {
          "name": "get_name",
          "args": {
            "query": "最近好看的电视剧推荐 2024",
            "searchDepth": "advanced"
          },
          "type": "tool_call",
          "id": "call_00_OfVAbpbkxzUK9ZtDVwQpSS3y"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 36,
        "input_tokens": 938,
        "total_tokens": 974,
        "input_token_details": {
          "cache_read": 0
        },
        "output_token_details": {}
      }
    },
    ToolMessage {
      "id": "fbab689c-64c0-4a5b-9a82-19f278e62d34",
      "content": "{\n  \"query\": \"最近好看的电视剧推荐 2024\",\n  \"follow_up_questions\": null,\n  \"answer\": null,\n  \"images\": [],\n  \"results\": [\n    {\n      \"url\": \"https://www.163.com/dy/article/JLC7GOE20552R76G.html\",\n      \"title\": \"网络评选2024年最火的十部电视剧，《小巷人家》排在第七位 - 网易\",\n      \"content\": \"《永夜星河》有些高开低走，前半部分拍的确实不错，但是后半部分差强人意。\\n\\n总的来说，在同类型影视剧中算是及格线以上的水平。\\n\\n第九名：《承欢记》\\n\\n《承欢记》改编自亦舒上世纪90年代写的一本小说，故事内容比较老套，基本上看个一两集就能猜出剧情走向。\\n\\n豆瓣评分只有6.2分，刚过及格线，剧情比较悬浮，离普通人很远，所以也没有多少人讨论剧情。能够排在第九位，只能说演员功不可没。\\n\\n第十名：《墨雨云间》\\n\\n现在古偶剧不拍穿越了，都改成重生了。\\n\\n《墨雨云间》是大女主复仇题材的爽剧，如果不追求细节，不考虑内涵，只看故事，确实挺爽的。\\n\\n这种剧起码比那些只知道谈恋爱的“二人转”式仙侠剧强很多。\\n\\n以上就是2024年最火的十部电视剧，不知道您对这个排名是否满意呢？\\n\\n特别声明：以上内容(如有图片或视频亦包括在内)为自媒体平台“网易号”用户上传并发布，本平台仅提供信息存储服务。 [...] 新闻\\n\\n体育\\n\\n娱乐\\n\\n财经\\n\\n汽车\\n\\n科技\\n\\n时尚\\n\\n手机\\n/\\n数码\\n\\n房产\\n/\\n家居\\n\\n教育\\n\\n网络评选2024年最火的十部电视剧，《小巷人家》排在第七位\\n\\n用微信扫码二维码\\n\\n分享至好友和朋友圈\\n\\n最近网络上评选出了“2024年最具影响力的十部电视剧”，通俗一点说就是2024年热度最高，最火的十部电视剧。\\n\\n虽然这个榜单看起来每一部剧的排名都有数据支撑，但回想一下榜单中这些剧播出时的情况，感觉这个排名好像也不是特别准确。\\n\\n第一名：《庆余年》第二季\\n\\n这个应该没有什么争议，虽然《庆余年》第二季刚开播的时候，有些网友对于剧中大量喜剧化情节表示不满，但整体剧情和演员演技还是很在线的。\\n\\n尤其是年末《大奉打更人》开播之后，同样是男频大IP，两部剧一对比，就看出《庆余年》无论哪一方面都要明显高出一大截。\\n\\n所以《庆余年》第二季排在第一位，可以说既在情理之中，又在意料之中。\\n\\n第二名：《玫瑰的故事》\\n\\n虽然网上对刘亦菲的演技有些争议，但是她主演的电视剧收视率确实都不错。\\n\\n《玫瑰的故事》剧情并没有太多新意，改编自上世纪80年代初期的小说，现在看起来有些情节确实有点老套了。\",\n      \"score\": 0.87218446,\n      \"raw_content\": null\n    },\n    {\n      \"url\": \"https://www.dealmoon.com/guide/979597\",\n      \"title\": \"2024上映的热门国产电视剧盘点  1~12月高分大陆电视剧排行榜！\",\n      \"content\": \"周全意气用事裸辞待业在家，恰巧这时老婆车莉的公众号一夜爆红，变身创业女老板一枚，于是周全愉快的接受了一份新的工作，食宿全包，月薪税后两万，一入职还直接对接核心客户。\\n\\n从此，老婆是他的BOSS，儿子是他的客户，全职爸爸，鸡飞蛋打，父亲角色归位家庭，全新生活即将开始！\\n\\n### 《孤舟》\\n\\n> 主演: 曾舜晞 / 张颂文 / 陈都灵 / 王玉雯 / 张丰毅\\n> \\n> \\n> 类型: 悬疑 / 战争\\n> \\n> \\n> 首播: 2024-08-06\\n\\nImage 34: 孤舟 海报\\n\\n删除 Link 注释 小图\\n\\n图片来自于@豆瓣 ，版权属于原作者\\n\\n阵容强大！张颂文与曾瞬晞主演，还有张丰毅、周一围等参与出演。剧情讲述了在抗战爆发后，苏州顾家子弟顾易中（曾舜晞 饰）从宾夕法尼亚大学建筑系学成回国。\\n\\n在一次营救行动中，顾易中被日伪陷害为党内叛徒，于是将计就计主动潜入日伪，几经周折后成为一名潜伏人员，与苏州特工站站长周知非（张颂文 饰）和日军顾问近藤利男斗智斗勇。\\n\\n2024好看的电视剧推荐 - 7月\\n\\n| 7月高分大陆电视剧排行榜 | [...] 又是一年毕业季，上海陆家嘴金融城，陶无忌、程家元、胡悦等新一代金融毕业生成功入职申江银行，与他们的前辈赵辉、苗彻等一干老金融人一同直面金融风暴，在职业底线与金钱利益之间不断抉择取舍...\\n\\n### 《今天的她们》\\n\\n> 主演: 宋轶 / 佘诗曼 / 李纯 / 张国立 / 张超 / 王仁君 / 李俊贤\\n> \\n> \\n> 类型: 都市 / 职场\\n> \\n> \\n> 首播: 2024-03-29\\n\\nImage 51: 《今天的她们》海报\\n\\n删除 Link 注释 小图\\n\\n图片来自于@豆瓣 ，版权属于原作者\\n\\n由宋轶、佘诗曼、李纯主演的女性群像剧《今天的她们》以烟火成都为景，讲述一场关于美食“传承与守护”的故事。\\n\\n剧情简介：\\n\\n餐厅经理路真真(宋轶 饰)回到成都帮助闺蜜顾漫婷(李纯 饰)度过老字号川白楼的经营危机，面对来自投资公司的梁清然(佘诗曼 饰)的收购计划，三位性格各异的女性“不打不相识”，从分歧对立到一路同行，收获成长和蜕变的故事。\\n\\n2024好看的电视剧推荐 - 3月\\n\\n| 3月高分大陆电视剧排行榜 | [...] > 导演: 姚文逸 / 王天尉\\n> \\n> \\n> 编剧: 陈思诚\\n> \\n> \\n> 主演:邱泽 / 尚语贤 / 杨谨华 / 钟镇涛 / 俞灏明 / 张艺上...\\n> \\n> \\n> 类型: 悬疑 / 犯罪\\n> \\n> \\n> 首播: 2024-02-29\\n\\nImage 56: 唐人街探案2 海报\\n\\n删除 Link 注释 小图\\n\\n图片来自于@豆瓣 ，版权属于原作者\\n\\n唐探宇宙又一部电视剧集新鲜出炉，正在热播中！《唐人街探案2》剧情延续第一部的剧情，大家还记得第一部里的林黑犬、五大灵童、Q、Kiko吗？\\n\\n《唐人街探案2》剧情简介：\\n\\n光怪陆离的泰国，接连发生多起奇异的案件，“唐人街第一神探”唐仁的徒弟林默（邱泽 饰）白天是一名普通的化学老师，而夜晚化身城市卫道者，探查诡异迷案！错综复杂的线索背后，藏于黑暗的真相正慢慢浮出水面……\\n\\n2024好看的电视剧推荐 - 2月\\n\\n| 2月高分大陆电视剧排行榜 |\",\n      \"score\": 0.84918517,\n      \"raw_content\": null\n    }\n  ],\n  \"response_time\": 1.82,\n  \"request_id\": \"5628079f-aa81-43c8-b456-d5c05f5ebd68\"\n}",
      "name": "get_name",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_call_id": "call_00_OfVAbpbkxzUK9ZtDVwQpSS3y"
    },
    AIMessage {
      "id": "fdf99d41-198a-4747-a3c1-7a7d8f48a761",
      "content": "根据搜索结果，我为您推荐一些2024年热门的电视剧：\n\n## 🎬 2024年热门电视剧推荐\n\n### 🔥 最火剧集\n1. **《庆余年》第二季** - 古装权谋剧，剧情和演员演技都很在线，是目前最火热的剧集\n2. **《玫瑰的故事》** - 刘亦菲主演，虽然剧情有些老套但收视率不错\n3. **《小巷人家》** - 网络评选2024年最火十部剧中排名第七\n\n### 🆕 近期新剧\n4. **《孤舟》** (8月6日首播)\n   - 主演：曾舜晞、张颂文、陈都灵\n   - 类型：悬疑/战争剧\n   - 讲述抗战时期潜伏斗争的故事\n\n5. **《今天的她们》** (3月29日首播)\n   - 主演：宋轶、佘诗曼、李纯\n   - 类型：都市/职场女性群像剧\n   - 以成都美食文化为背景\n\n### 🎭 其他热门\n6. **《永夜星河》** - 古装剧，前半部分评价不错\n7. **《承欢记》** - 改编自亦舒小说\n8. **《墨雨云间》** - 大女主复仇题材爽剧\n9. **《唐人街探案2》** - 悬疑犯罪剧，唐探宇宙新作\n\n### 💡 推荐建议\n- 喜欢**权谋古装**：首选《庆余年》第二季\n- 喜欢**悬疑谍战**：推荐《孤舟》\n- 喜欢**都市职场**：可以看《今天的她们》\n- 喜欢**爽剧**：试试《墨雨云间》\n\n您对哪种类型的剧集比较感兴趣呢？我可以为您提供更详细的推荐！",
      "name": "model",
      "additional_kwargs": {},
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 2738,
          "completionTokens": 408,
          "totalTokens": 3146
        },
        "finish_reason": "stop",
        "model_provider": "openai",
        "model_name": "deepseek-chat",
        "usage": {
          "prompt_tokens": 2738,
          "completion_tokens": 408,
          "total_tokens": 3146,
          "prompt_tokens_details": {
            "cached_tokens": 896
          },
          "prompt_cache_hit_tokens": 896,
          "prompt_cache_miss_tokens": 1842
        },
        "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
      },
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 408,
        "input_tokens": 2738,
        "total_tokens": 3146,
        "input_token_details": {
          "cache_read": 896
        },
        "output_token_details": {}
      }
    }
  ]
}
 */