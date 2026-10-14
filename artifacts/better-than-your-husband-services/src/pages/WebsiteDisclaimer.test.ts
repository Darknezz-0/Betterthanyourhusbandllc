import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { businessInfo } from '../lib/business';

async function renderDisclaimer() {
  // The disclaimer builds its text at module load, so reload after mocking.
  const { WebsiteDisclaimer } = await import('./WebsiteDisclaimer');
  return renderToStaticMarkup(createElement(WebsiteDisclaimer));
}

afterEach(() => {
  vi.doUnmock('@/lib/business');
  vi.resetModules();
});

describe('WebsiteDisclaimer contact details', () => {
  it('preserves the complete rendered legal disclaimer', async () => {
    const html = await renderDisclaimer();

    expect(html).toContain(`Email: ${businessInfo.contact.email}`);
    // Only the email is variable; the approved wording, dates, phone, policy
    // list, and rendered structure are frozen independently of the component.
    expect(
      html.replaceAll(businessInfo.contact.email, '[CONTACT_EMAIL]').replaceAll('><', '>\n<'),
    ).toMatchSnapshot();
  });

  it.each(['disclaimer-contact@example.test', 'updated-inbox@example.test'])(
    'renders shared email %s without changing anything else',
    async (email) => {
      const originalHtml = await renderDisclaimer();

      vi.resetModules();
      vi.doMock('@/lib/business', () => ({
        businessInfo: {
          ...businessInfo,
          contact: { ...businessInfo.contact, email },
        },
      }));

      const updatedHtml = await renderDisclaimer();

      expect(updatedHtml).toContain(`Email: ${email}`);
      expect(updatedHtml).not.toContain(businessInfo.contact.email);
      expect(updatedHtml.split(email)).toHaveLength(2);
      expect(updatedHtml).toBe(
        originalHtml.replace(`Email: ${businessInfo.contact.email}`, `Email: ${email}`),
      );
    },
  );
});
