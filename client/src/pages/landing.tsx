import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  Star, 
  PieChart,
  Bell,
  LogIn,
  ArrowRight,
  Check
} from "lucide-react";

export function Landing() {
  const features = [
    {
      icon: TrendingUp,
      title: "Real-Time Market Data",
      description: "Get live cryptocurrency prices, market caps, and 24h changes from trusted sources like CoinGecko."
    },
    {
      icon: PieChart,
      title: "Portfolio Tracking",
      description: "Track your crypto investments with detailed portfolio analytics and performance metrics."
    },
    {
      icon: Bell,
      title: "Price Alerts",
      description: "Set custom price alerts and never miss important market movements again."
    },
    {
      icon: Star,
      title: "Personal Watchlist",
      description: "Create and manage your own watchlist of favorite cryptocurrencies."
    },
    {
      icon: Zap,
      title: "Interactive Charts",
      description: "Analyze price trends with interactive charts and multiple timeframes."
    },
    {
      icon: Globe,
      title: "Comprehensive News",
      description: "Stay updated with the latest crypto news from multiple trusted sources."
    }
  ];

  const stats = [
    { label: "Cryptocurrencies Tracked", value: "1000+" },
    { label: "News Sources", value: "15+" },
    { label: "Daily Updates", value: "24/7" },
    { label: "Chart Timeframes", value: "5" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              🚀 New: Portfolio Tracking & Price Alerts
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Ultimate{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Crypto Dashboard
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Track real-time cryptocurrency prices, manage your portfolio, and stay updated with the latest news. 
              Everything you need to make informed crypto decisions in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-get-started"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-learn-more"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 sm:py-24 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to help you track, analyze, and manage your cryptocurrency investments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose BasedHub?
              </h2>
              
              <div className="space-y-4 mb-8">
                {[
                  "Real-time data from trusted sources",
                  "Clean, intuitive user interface",
                  "Mobile-first responsive design",
                  "Advanced portfolio tracking",
                  "Comprehensive news coverage",
                  "Secure authentication system"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-start-tracking"
              >
                Start Tracking Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span>Secure & Reliable</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Your data is protected with enterprise-grade security. We use Replit's authentication system 
                      and never store sensitive information.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">256-bit SSL</Badge>
                      <Badge variant="outline">OAuth 2.0</Badge>
                      <Badge variant="outline">GDPR Compliant</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust BasedHub for their cryptocurrency tracking needs.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-join-now"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Join Now - It's Free
          </Button>
        </div>
      </div>
    </div>
  );
}