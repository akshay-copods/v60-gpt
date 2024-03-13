const { openai } = require("./openai.js");
const { MemoryVectorStore } = require( "langchain/vectorstores/memory")
const { OpenAIEmbeddings } = require( "@langchain/openai")
const { CharacterTextSplitter } = require("langchain/text_splitter")
const { PDFLoader } = require("langchain/document_loaders/fs/pdf")




const createStore = (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());



const docsFromPDF = () => {
  const loader = new PDFLoader("./v60-vent.pdf");
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: ". ",
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  );
};

const loadStore = async () => {
  // const videDocs = await docsFromYoutubeVideo(video);
  const pdfDocs = await docsFromPDF();
  return createStore([...pdfDocs]);
};

 const query = async (chatMessage) => {
  const store = await loadStore();
  const results = await store.similaritySearch(chatMessage, 2);
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't fabricate answers. Instead, clearly state that more context is needed. If applicable, offer related terms or suggestions based on the context, using phrases like 'Did you mean ...?' or 'Are you looking for ...?'. 
        Question: ${chatMessage} 
        Context: ${results.map((r) => r.pageContent).join("\n")}`,
      },
    ],
  });

  console.log(
    `Answer: ${response?.choices[0]?.message?.content} \n Sources: ${results
      ?.map((r) => r?.metadata?.source)
      .join(", ")}`
  );
  return response?.choices[0]?.message?.content
};


exports.query = query;