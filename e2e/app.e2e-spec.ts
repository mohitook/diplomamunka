import { DiplomamunkaPage } from './app.po';

describe('diplomamunka App', function() {
  let page: DiplomamunkaPage;

  beforeEach(() => {
    page = new DiplomamunkaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
