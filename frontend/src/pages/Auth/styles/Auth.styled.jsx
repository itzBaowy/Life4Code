
import styled from 'styled-components';

export const LoginWrapper = styled.div`
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #0a0d16;
	position: relative;
	overflow: hidden;
`;

export const LoginCard = styled.div`
	position: relative;
	z-index: 1;
	background: #151925;
	border-radius: 1.5rem;
	box-shadow: 0 4px 32px 0 rgba(0,0,0,0.25), 0 1.5px 8px 0 rgba(80, 80, 180, 0.10);
	padding: 2.5rem 2.5rem 2rem 2.5rem;
	min-width: 350px;
	max-width: 430px;
	width: 100%;
	margin: 2rem 0;
	border: 1.5px solid #23263a;
	backdrop-filter: blur(2px);
	transition: box-shadow 0.2s;
	&:hover {
		box-shadow: 0 8px 40px 0 rgba(0,0,0,0.32), 0 2px 12px 0 rgba(80, 80, 180, 0.13);
	}
`;

export const Title = styled.h2`
	font-size: 2rem;
	font-weight: 800;
	color: #fff;
	margin-bottom: 0.5rem;
	letter-spacing: -1px;
	text-align: center;
`;

export const SubTitle = styled.p`
	font-size: 1.1rem;
	color: #b3b8d0;
	margin-bottom: 1.5rem;
	text-align: center;
`;

export const ErrorText = styled.div`
	color: #ff6b6b;
	background: #23181b;
	border-radius: 0.75rem;
	padding: 0.75rem 1rem;
	margin-bottom: 1rem;
	font-size: 1rem;
	font-weight: 500;
	text-align: center;
	border: 1px solid #ffb3b3;
`;
