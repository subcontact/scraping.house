import { expect, test } from '@oclif/test';

describe('linked:me:get', () => {
  test
    .stdout()
    .command(['linked:me:get'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['linked:me:get', '--name', 'jeff'])
    .it('runs hello --name jeff', (ctx) => {
      expect(ctx.stdout).to.contain('hello jeff');
    });
});
