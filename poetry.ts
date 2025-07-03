type Poem = {
  title: string;
  author: string;
  lines: string[];
  linecount: number;
};

const BASE_URL = "https://poetrydb.org";

function showSpinner() {
  document.getElementById("spinner")!.classList.remove("hidden");
}
function hideSpinner() {
  document.getElementById("spinner")!.classList.add("hidden");
}

(window as any).toggleAdvanced = () => {
  const advanced = document.getElementById("advanced")!;
  advanced.classList.toggle("hidden");
};

function printPoems(poems: Poem[], label: string) {
  const includeTitle = (document.getElementById("includeTitle") as HTMLInputElement).checked;
  const includeAuthor = (document.getElementById("includeAuthor") as HTMLInputElement).checked;
  const includeLineCount = (document.getElementById("includeLineCount") as HTMLInputElement).checked;
  const includeLines = (document.getElementById("includeLines") as HTMLInputElement).checked;

  const output = document.getElementById("output")!;
  output.textContent =
    `${label}\n\n` +
    poems
      .map((p) => {
        const parts: string[] = [];
        if (includeTitle && includeAuthor && includeLineCount && includeLines) {
          parts.push(`Title: ${p.title}`);
          parts.push(`Author: ${p.author}`);
          parts.push(`Line Count: ${p.linecount}`);
          parts.push('\n');
          parts.push(p.lines.join("\n"));
        }
        if (includeTitle) parts.push(`Title: ${p.title}`);
        if (includeAuthor) parts.push(`Author: ${p.author}`);
        if (includeLineCount) parts.push(`Line Count: ${p.linecount}`);
        if (includeLines) parts.push('\n');
        if (includeLines) parts.push(p.lines.join("\n"));

        return parts.join("\n");
      })
      .join("\n\n---\n\n");
}


async function fetchPoems(endpoint: string): Promise<Poem[]> {
  const response = await fetch(`${BASE_URL}/${endpoint}`);
  if (!response.ok)
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  const data = await response.json();
  if (data.status === 404) throw new Error("No poems found.");
  return data;
}

(window as any).searchPoems = async () => {
  const getInput = (id: string) =>
    (document.getElementById(id) as HTMLInputElement).value.trim();
  const author = getInput("authorInput");
  const title = getInput("titleInput");
  const matchExactly = (
    document.getElementById("matchExactly") as HTMLInputElement
  ).checked;
  const linecount = getInput("linecountInput");
  const lineText = getInput("lineTextInput");
  const poemCount = getInput("poemCountInput");
  const output = document.getElementById("output")!;
  const includeLines: boolean = (
    document.getElementById("includeLines") as HTMLInputElement
  ).checked;
  const includeAuthor: boolean = (
    document.getElementById("includeAuthor") as HTMLInputElement
  ).checked;
  const includeTitle: boolean = (
    document.getElementById("includeTitle") as HTMLInputElement
  ).checked;
  const includeLineCount: boolean = (
    document.getElementById("includeLineCount") as HTMLInputElement
  ).checked;
  output.textContent = "";
  showSpinner();

  const warning = document.getElementById("outputWarning")!;

  if (!includeTitle && !includeAuthor && !includeLineCount && !includeLines) {
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
  try {
    if (!author && !title && !linecount && !lineText && !poemCount) {
      throw new Error("Please enter at least one search filter.");
    }

    let endpoint = "";
    let labelParts: string[] = [];
    let filters: string[] = [];

    if (author) {
      filters.push("author");
      labelParts.push(author);
    }
    if (title) {
      filters.push("title");
      if (!matchExactly) {
        labelParts.push(title);
      } else {
        labelParts.push(`${title}:abs`);
      }
    }
    if (linecount) {
      filters.push("linecount");
      labelParts.push(linecount);
    }
    if (lineText) {
      filters.push("lines");
      labelParts.push(lineText);
    }
    if (poemCount) {
      filters.push("poemcount");
      labelParts.push(poemCount);
    }
    const finalLabels: string = labelParts.join(";");
    const finalTerms: string = filters.join(",");

    const output: string[] = [];
    let finalOutput: string;
    if (includeTitle && includeAuthor && includeLines && includeLineCount) {
      finalOutput = "";
    } else {
      if (includeLines) {
        output.push("lines");
      }
      if (includeAuthor) {
        output.push("author");
      }
      if (includeTitle) {
        output.push("title");
      }
      if (includeLineCount) {
        output.push("linecount");
      }
      finalOutput = output.join(",");
    }
    const labels = filters.map((filter, i) => `${filter}: ${labelParts[i]}`);

    endpoint = `${finalTerms}/${finalLabels}${
      finalOutput ? "/" + finalOutput : ""
    }`;
    const poems = await fetchPoems(endpoint);

    printPoems(poems, labels.join(", "));
  } catch (err) {
    output.textContent = "Error: " + (err as Error).message;
  } finally {
    hideSpinner();
  }
};
