import { authorizer } from '@openauthjs/openauth';
import { CloudflareStorage } from '@openauthjs/openauth/storage/cloudflare';
import { type ExecutionContext, type KVNamespace } from '@cloudflare/workers-types';
import { subjects } from './subjects';
import { PasswordAdapter } from '@openauthjs/openauth/adapter/password';
import { PasswordUI } from '@openauthjs/openauth/ui/password';

async function getUser(email: string) {
	// Get user from database
	// Return user ID
	return '123';
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return authorizer({
			storage: CloudflareStorage({
				namespace: env.kv,
			}),
			subjects,
			providers: {
				password: PasswordAdapter(
					PasswordUI({
						sendCode: async (email, code) => {
							console.log(email, code);
						},
					})
				),
			},
			success: async (ctx, value) => {
				if (value.provider === 'password') {
					return ctx.subject('user', {
						id: await getUser(value.email),
					});
				}
				throw new Error('Invalid provider');
			},
		}).fetch(request, env, ctx);
	},
};
