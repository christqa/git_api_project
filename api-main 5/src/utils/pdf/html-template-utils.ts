import { Liquid } from 'liquidjs';
import {
  HtmlAnalyteTemplatePaths,
  HtmlTemplateTypes,
} from '@modules/pdf-report/html-template-enums';
import fs from 'fs';
import path from 'path';

const generateTemplate = async (
  // eslint-disable-next-line
  inputData: any,
  // eslint-disable-next-line
  engine: any,
  template: string
) => {
  const tpl = engine.parse(template);
  return engine.render(tpl, inputData);
};

export class HtmlTemplateManager {
  public static html_templates = {
    [HtmlTemplateTypes.ANALYTES]: HtmlAnalyteTemplatePaths.REPORT,
  };
  private static engine: Liquid | null = null;
  private static template_as_string: Record<string, string> = {};

  public static async generateTemplate(
    // eslint-disable-next-line
    transformed_data: any,
    template_name: string
  ): Promise<string> {
    const template_data = this.getTemplateAsString(template_name);
    const tpl = this.getEngine().parse(template_data);
    return this.getEngine().render(tpl, transformed_data);
  }

  private static getEngine() {
    if (this.engine) {
      return this.engine;
    }
    this.engine = new Liquid();
    return this.engine;
  }

  private static getTemplateAsString(templatePath: string): string {
    if (templatePath in this.template_as_string) {
      return this.template_as_string[templatePath];
    }
    const template = fs.readFileSync(
      path.resolve(__dirname, templatePath),
      'utf-8'
    );
    this.template_as_string[templatePath] = template;
    return template;
  }
}

export default generateTemplate;
