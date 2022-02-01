import { expect, test } from '@oclif/test';

describe('linked:me:post', () => {
  test
    .stdout()
    .command(['linked:me:post'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['linked:me:post', '--name', 'jeff'])
    .it('runs hello --name jeff', (ctx) => {
      expect(ctx.stdout).to.contain('hello jeff');
    });
});
